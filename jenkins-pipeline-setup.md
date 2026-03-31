# Jenkins Master–Slave Pipeline Setup

This document covers the complete Jenkins Master–Slave (Controller–Agent) architecture setup on AWS EC2, including IAM roles/policies, agent provisioning, and all CI/CD pipeline definitions for this project.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AWS IAM Setup](#aws-iam-setup)
   - [IAM Role: Jenkins Master](#iam-role-jenkins-master)
   - [IAM Role: Jenkins Agent (Slave)](#iam-role-jenkins-agent-slave)
   - [IAM User: Jenkins ECR Deployer (alternative)](#iam-user-jenkins-ecr-deployer)
   - [ECR Repository Policies](#ecr-repository-policies)
3. [EC2 Instance Setup](#ec2-instance-setup)
   - [Master Node](#master-node)
   - [Slave Node(s)](#slave-nodes)
4. [Jenkins Master Configuration](#jenkins-master-configuration)
   - [Install Jenkins on Master](#install-jenkins-on-master)
   - [Required Plugins](#required-plugins)
   - [Global Tool Configuration](#global-tool-configuration)
   - [Credentials Setup](#credentials-setup)
5. [Slave Agent Setup](#slave-agent-setup)
   - [Option A: SSH-Based Permanent Agent](#option-a-ssh-based-permanent-agent)
   - [Option B: JNLP (Inbound) Agent](#option-b-jnlp-inbound-agent)
   - [Option C: EC2 Plugin (Dynamic Agents)](#option-c-ec2-plugin-dynamic-agents)
6. [Agent Labels & Node Strategy](#agent-labels--node-strategy)
7. [Pipeline 1: CI – Backend](#pipeline-1-ci--backend)
8. [Pipeline 2: CI – Frontend](#pipeline-2-ci--frontend)
9. [Pipeline 3: Deploy Backend to ECR](#pipeline-3-deploy-backend-to-ecr)
10. [Pipeline 4: Deploy Frontend to ECR](#pipeline-4-deploy-frontend-to-ecr)
11. [Jenkinsfile (Unified)](#jenkinsfile-unified)
12. [Security Hardening & Best Practices](#security-hardening--best-practices)
13. [Troubleshooting](#troubleshooting)
14. [Reference: GitHub Actions → Jenkins Mapping](#reference-github-actions--jenkins-mapping)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                           │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │  Jenkins Master   │         │  Jenkins Slave (build)   │  │
│  │  (Controller)     │◄──SSH──►│  Label: build-agent      │  │
│  │                   │         │                          │  │
│  │  - Orchestration  │         │  - JDK 21                │  │
│  │  - UI / API       │         │  - Node.js 22            │  │
│  │  - Scheduling     │         │  - Docker                │  │
│  │  - Credentials    │         │  - AWS CLI               │  │
│  │                   │         │  - Gradle cache          │  │
│  │  IAM Role:        │         │                          │  │
│  │  jenkins-master   │         │  IAM Role:               │  │
│  │                   │         │  jenkins-agent            │  │
│  └────────┬─────────┘         └──────────┬───────────────┘  │
│           │                              │                   │
│           │         ┌────────────────────┘                   │
│           │         │                                        │
│           ▼         ▼                                        │
│  ┌──────────────────────┐     ┌──────────────────────────┐  │
│  │  Amazon ECR           │     │  Jenkins Slave (deploy)  │  │
│  │                       │     │  Label: docker-agent     │  │
│  │  doc-backend          │◄────│  (optional dedicated)    │  │
│  │  doc-frontend         │     │                          │  │
│  └──────────────────────┘     └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

| Component | Instance Type | Purpose |
|---|---|---|
| **Master** | `t3.medium` (2 vCPU, 4 GB) | Orchestration only – no builds |
| **Build Agent** | `t3.large` (2 vCPU, 8 GB) | CI builds, tests, Docker builds, ECR push |
| **Deploy Agent** *(optional)* | `t3.medium` | Dedicated Docker/deploy tasks |

---

## AWS IAM Setup

### IAM Role: Jenkins Master

The master only needs EC2 permissions (to manage dynamic agents if using EC2 plugin) and minimal access.

**Role name**: `jenkins-master-role`
**Attach to**: Master EC2 instance (Instance Profile)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EC2PluginDynamicAgents",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeRegions",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeKeyPairs",
        "ec2:DescribeImages",
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:CreateTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRoleToEC2Agents",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/jenkins-agent-role",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ec2.amazonaws.com"
        }
      }
    },
    {
      "Sid": "DescribeECR",
      "Effect": "Allow",
      "Action": [
        "ecr:DescribeRepositories",
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    }
  ]
}
```

**Trust policy** (for EC2 instance profile):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### IAM Role: Jenkins Agent (Slave)

Agents need ECR push access and Docker operations.

**Role name**: `jenkins-agent-role`
**Attach to**: All slave EC2 instances (Instance Profile)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuthToken",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "ECRPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages",
        "ecr:ListImages"
      ],
      "Resource": [
        "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/full-stack-docker/doc-backend",
        "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/full-stack-docker/doc-frontend"
      ]
    }
  ]
}
```

**Trust policy** (same EC2 trust):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### IAM User: Jenkins ECR Deployer

If you prefer IAM user credentials (stored in Jenkins) instead of instance profiles:

**User name**: `jenkins-ecr-deployer`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuth",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "ECRRepoPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:DescribeImages",
        "ecr:ListImages"
      ],
      "Resource": [
        "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/full-stack-docker/doc-backend",
        "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/full-stack-docker/doc-frontend"
      ]
    }
  ]
}
```

> Generate an **Access Key** for this user and store it as Jenkins credentials (see [Credentials Setup](#credentials-setup)).

### ECR Repository Policies

Ensure the ECR repos exist:

```bash
aws ecr create-repository --repository-name full-stack-docker/doc-backend --region us-east-1
aws ecr create-repository --repository-name full-stack-docker/doc-frontend --region us-east-1
```

Optional: Add a lifecycle policy to keep only the last 20 images:

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 20 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 20
      },
      "action": { "type": "expire" }
    }
  ]
}
```

```bash
aws ecr put-lifecycle-policy \
  --repository-name full-stack-docker/doc-backend \
  --lifecycle-policy-text file://ecr-lifecycle.json \
  --region us-east-1
```

---

## EC2 Instance Setup

### Security Groups

**Jenkins Master SG** (`jenkins-master-sg`):

| Type | Port | Source | Purpose |
|---|---|---|---|
| Inbound | 8080 | Your IP / ALB | Jenkins UI |
| Inbound | 50000 | Agent SG | JNLP agent communication |
| Inbound | 22 | Your IP | SSH admin access |
| Outbound | All | 0.0.0.0/0 | Internet access |

**Jenkins Agent SG** (`jenkins-agent-sg`):

| Type | Port | Source | Purpose |
|---|---|---|---|
| Inbound | 22 | Master SG | SSH from master |
| Outbound | All | 0.0.0.0/0 | Internet (pull deps, push ECR) |

### Master Node

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t3.medium \
  --key-name jenkins-key \
  --security-group-ids sg-xxxxx \
  --iam-instance-profile Name=jenkins-master-role \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=jenkins-master}]' \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]'
```

### Slave Node(s)

```bash
# Launch build agent
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t3.large \
  --key-name jenkins-key \
  --security-group-ids sg-yyyyy \
  --iam-instance-profile Name=jenkins-agent-role \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=jenkins-build-agent}]' \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":50,"VolumeType":"gp3"}}]'
```

---

## Jenkins Master Configuration

### Install Jenkins on Master

```bash
#!/bin/bash
# Run on master EC2 (Ubuntu 22.04/24.04)

# Java 21
sudo apt update && sudo apt install -y fontconfig
wget https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.deb
sudo dpkg -i jdk-21_linux-x64_bin.deb

# Jenkins
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update && sudo apt install -y jenkins

# Start
sudo systemctl enable jenkins && sudo systemctl start jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

> **Important**: Set master executors to **0** in Manage Jenkins → Nodes → Built-In Node → Configure → # of executors = `0`. The master should NOT run builds.

### Required Plugins

Install via **Manage Jenkins → Plugins → Available**:

| Plugin | Purpose |
|---|---|
| **SSH Build Agents** | Connect to slave nodes over SSH |
| **Amazon EC2** | Dynamic agent provisioning (optional) |
| **Pipeline** | Declarative/scripted pipelines |
| **Git** | Source code checkout |
| **NodeJS** | Node.js tool auto-installer |
| **Docker Pipeline** | Docker build/push steps |
| **Amazon ECR** | ECR credential helper |
| **Credentials Binding** | Inject secrets into builds |
| **Timestamper** | Timestamps in console output |
| **Blue Ocean** | Modern pipeline UI (optional) |

### Global Tool Configuration

**Manage Jenkins → Tools**:

| Tool | Name | Config |
|---|---|---|
| JDK | `jdk-21` | Install from adoptium.net → Temurin 21 |
| NodeJS | `node-22` | Install from nodejs.org → 22.x |

### Credentials Setup

**Manage Jenkins → Credentials → System → Global credentials**:

| Credential ID | Type | Description |
|---|---|---|
| `aws-credentials` | Username with password | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (skip if using IAM instance profiles) |
| `google-client-id` | Secret text | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| `backend-internal-url` | Secret text | `BACKEND_INTERNAL_URL` |
| `jenkins-agent-ssh-key` | SSH Username with private key | Private key to SSH into slave nodes (username: `ubuntu`) |

---

## Slave Agent Setup

### Prerequisite: Install Tools on Every Slave

Run this on each slave EC2 instance:

```bash
#!/bin/bash
# slave-bootstrap.sh — Run on each agent node

set -euo pipefail

echo "=== Updating system ==="
sudo apt update && sudo apt upgrade -y

echo "=== Installing JDK 21 ==="
sudo apt install -y fontconfig
wget -q https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.deb
sudo dpkg -i jdk-21_linux-x64_bin.deb
java -version

echo "=== Installing Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

echo "=== Installing Docker ==="
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin
sudo usermod -aG docker ubuntu
newgrp docker

echo "=== Installing AWS CLI v2 ==="
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install -y unzip
unzip awscliv2.zip && sudo ./aws/install
aws --version

echo "=== Installing Git ==="
sudo apt install -y git

echo "=== Creating Jenkins workspace ==="
sudo mkdir -p /home/ubuntu/jenkins-agent
sudo chown ubuntu:ubuntu /home/ubuntu/jenkins-agent

echo "=== Done! Agent is ready. ==="
```

### Option A: SSH-Based Permanent Agent (Recommended)

This is the simplest and most common approach.

**Step 1**: On the **master**, generate an SSH key pair (or use an existing one):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/jenkins-agent-key -N ""
```

**Step 2**: Copy the public key to each **slave**:

```bash
ssh-copy-id -i ~/.ssh/jenkins-agent-key.pub ubuntu@<SLAVE_PRIVATE_IP>
```

**Step 3**: Add the private key as a Jenkins credential:
- Go to **Manage Jenkins → Credentials → Add Credentials**
- Kind: **SSH Username with private key**
- ID: `jenkins-agent-ssh-key`
- Username: `ubuntu`
- Private Key: paste contents of `~/.ssh/jenkins-agent-key`

**Step 4**: Add the node in Jenkins:
1. **Manage Jenkins → Nodes → New Node**
2. Fill in:
   - **Node name**: `build-agent-1`
   - **Type**: Permanent Agent
   - **# of executors**: `2` (adjust based on CPU)
   - **Remote root directory**: `/home/ubuntu/jenkins-agent`
   - **Labels**: `build-agent docker-agent`
   - **Usage**: Only build jobs with label expressions matching this node
   - **Launch method**: Launch agents via SSH
     - Host: `<SLAVE_PRIVATE_IP>`
     - Credentials: `jenkins-agent-ssh-key`
     - Host Key Verification Strategy: Known hosts file (or Non verifying for initial setup)
   - **Availability**: Keep this agent online as much as possible

**Step 5**: Click **Save** → Jenkins will SSH into the slave and launch the agent automatically.

### Option B: JNLP (Inbound) Agent

Use when slaves can't accept inbound SSH (e.g., behind NAT).

**Step 1**: Create the node in Jenkins (same as above) but:
- **Launch method**: Launch agent by connecting it to the controller

**Step 2**: On the **slave**, download and run the agent JAR:

```bash
# Download agent.jar from master
curl -sO http://<MASTER_IP>:8080/jnlpJars/agent.jar

# Run (get the secret from the node's page in Jenkins UI)
java -jar agent.jar \
  -url http://<MASTER_IP>:8080/ \
  -secret <AGENT_SECRET> \
  -name "build-agent-1" \
  -workDir "/home/ubuntu/jenkins-agent"
```

**Step 3**: Create a systemd service for auto-start:

```ini
# /etc/systemd/system/jenkins-agent.service
[Unit]
Description=Jenkins JNLP Agent
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/jenkins-agent
ExecStart=/usr/bin/java -jar /home/ubuntu/jenkins-agent/agent.jar \
  -url http://<MASTER_IP>:8080/ \
  -secret <AGENT_SECRET> \
  -name "build-agent-1" \
  -workDir "/home/ubuntu/jenkins-agent"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable jenkins-agent && sudo systemctl start jenkins-agent
```

### Option C: EC2 Plugin (Dynamic Agents)

Agents are launched on-demand and terminated after the build.

**Step 1**: Install the **Amazon EC2** plugin.

**Step 2**: Go to **Manage Jenkins → Clouds → New Cloud → Amazon EC2**:

| Setting | Value |
|---|---|
| Name | `aws-ec2-cloud` |
| Region | `us-east-1` |
| EC2 Credentials | Use instance profile (master IAM role) or `aws-credentials` |
| AMI | Custom AMI with tools pre-installed (from slave bootstrap script) |
| Instance Type | `t3.large` |
| Security Group | `jenkins-agent-sg` |
| Remote root dir | `/home/ubuntu/jenkins-agent` |
| Remote user | `ubuntu` |
| Labels | `build-agent docker-agent` |
| Usage | Only build jobs with label expressions |
| Idle termination time | `15` minutes |
| Init script | *(optional — if not baked into AMI)* |
| IAM Instance Profile | `jenkins-agent-role` |
| Number of executors | `2` |

**Step 3**: Create a custom AMI:

```bash
# Launch a fresh EC2, run slave-bootstrap.sh, then:
aws ec2 create-image \
  --instance-id i-xxxxx \
  --name "jenkins-agent-ami-$(date +%Y%m%d)" \
  --no-reboot
```

---

## Agent Labels & Node Strategy

| Label | Assigned To | Used By |
|---|---|---|
| `build-agent` | All slave nodes | CI pipelines (build/test) |
| `docker-agent` | Slaves with Docker | Docker build & ECR push stages |
| `backend-agent` | *(optional)* Dedicated backend slave | Backend-heavy builds |
| `frontend-agent` | *(optional)* Dedicated frontend slave | Frontend/Node.js builds |

In pipelines, target agents using:

```groovy
agent { label 'build-agent' }          // Any build agent
agent { label 'docker-agent' }         // Agents with Docker
agent { label 'build-agent && docker-agent' }  // Both capabilities
```

---

## Pipeline 1: CI – Backend

**GitHub Actions equivalent**: `.github/workflows/ci-backend.yml`

```groovy
// Jenkinsfile-ci-backend
pipeline {
    agent { label 'build-agent' }

    tools {
        jdk 'jdk-21'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Check Changes') {
            steps {
                script {
                    def changes = currentBuild.changeSets.collectMany { it.items.collectMany { item -> item.affectedPaths } }
                    if (changes && !changes.any { it.startsWith('DocumentOrganiser-Backend/') }) {
                        currentBuild.result = 'NOT_BUILT'
                        error('No backend changes detected – skipping.')
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir('DocumentOrganiser-Backend') {
                    sh 'chmod +x gradlew'
                    sh './gradlew build --no-daemon -x test'
                }
            }
        }

        stage('Test') {
            environment {
                SPRING_PROFILES_ACTIVE = 'test'
            }
            steps {
                dir('DocumentOrganiser-Backend') {
                    sh './gradlew test --no-daemon'
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'DocumentOrganiser-Backend/**/build/test-results/**/*.xml'
            cleanWs()
        }
    }
}
```

---

## Pipeline 2: CI – Frontend

**GitHub Actions equivalent**: `.github/workflows/ci-frontend.yml`

```groovy
// Jenkinsfile-ci-frontend
pipeline {
    agent { label 'build-agent' }

    tools {
        nodejs 'node-22'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Check Changes') {
            steps {
                script {
                    def changes = currentBuild.changeSets.collectMany { it.items.collectMany { item -> item.affectedPaths } }
                    if (changes && !changes.any { it.startsWith('DocumentOrganiser-Frontend/') }) {
                        currentBuild.result = 'NOT_BUILT'
                        error('No frontend changes detected – skipping.')
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Check Formatting') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npx prettier --check "src/**/*.{ts,tsx,json,css}"'
                }
            }
        }

        stage('Type Check') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npx tsc --noEmit'
                }
            }
        }

        stage('Build') {
            environment {
                NEXT_TELEMETRY_DISABLED = '1'
            }
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
```

---

## Pipeline 3: Deploy Backend to ECR

**GitHub Actions equivalent**: `.github/workflows/deploy-backend.yml`

Trigger on tags matching `v*`.

```groovy
// Jenkinsfile-deploy-backend
pipeline {
    agent { label 'docker-agent' }

    tools {
        jdk 'jdk-21'
    }

    environment {
        AWS_REGION     = 'us-east-1'
        ECR_REPOSITORY = 'full-stack-docker/doc-backend'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Extract Version') {
            steps {
                script {
                    env.VERSION = env.TAG_NAME?.replaceFirst(/^v/, '') ?: sh(script: 'git describe --tags --abbrev=0 | sed "s/^v//"', returnStdout: true).trim()
                    env.COMMIT_SHA = sh(script: 'git rev-parse --short=8 HEAD', returnStdout: true).trim()
                    echo "Deploying version: ${env.VERSION} (commit: ${env.COMMIT_SHA})"
                }
            }
        }

        stage('Test') {
            environment {
                SPRING_PROFILES_ACTIVE = 'test'
            }
            steps {
                dir('DocumentOrganiser-Backend') {
                    sh 'chmod +x gradlew'
                    sh './gradlew test --no-daemon'
                }
            }
        }

        stage('Build JAR') {
            steps {
                dir('DocumentOrganiser-Backend') {
                    sh './gradlew bootJar --no-daemon -x test'
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    // Using IAM instance profile (preferred) — no credentials block needed
                    // If using IAM user, wrap in withCredentials([usernamePassword(...)])
                    def accountId = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                    def registry = "${accountId}.dkr.ecr.${AWS_REGION}.amazonaws.com"

                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${registry}"

                    sh """
                        docker build \
                            -t ${registry}/${ECR_REPOSITORY}:${VERSION} \
                            -t ${registry}/${ECR_REPOSITORY}:${COMMIT_SHA} \
                            -f DocumentOrganiser-Backend/Dockerfile \
                            DocumentOrganiser-Backend/

                        docker push ${registry}/${ECR_REPOSITORY}:${VERSION}
                        docker push ${registry}/${ECR_REPOSITORY}:${COMMIT_SHA}
                    """

                    echo "✅ Backend image pushed: ${registry}/${ECR_REPOSITORY}:${VERSION}"
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
            cleanWs()
        }
    }
}
```

<details>
<summary><strong>Alternative: Using IAM User credentials instead of instance profile</strong></summary>

Replace the `Build & Push Docker Image` stage `steps` block with:

```groovy
steps {
    withCredentials([usernamePassword(
        credentialsId: 'aws-credentials',
        usernameVariable: 'AWS_ACCESS_KEY_ID',
        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
    )]) {
        script {
            def accountId = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
            def registry = "${accountId}.dkr.ecr.${AWS_REGION}.amazonaws.com"
            sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${registry}"
            sh """
                docker build \
                    -t ${registry}/${ECR_REPOSITORY}:${VERSION} \
                    -t ${registry}/${ECR_REPOSITORY}:${COMMIT_SHA} \
                    -f DocumentOrganiser-Backend/Dockerfile \
                    DocumentOrganiser-Backend/
                docker push ${registry}/${ECR_REPOSITORY}:${VERSION}
                docker push ${registry}/${ECR_REPOSITORY}:${COMMIT_SHA}
            """
        }
    }
}
```

</details>

---

## Pipeline 4: Deploy Frontend to ECR

**GitHub Actions equivalent**: `.github/workflows/deploy-frontend.yml`

```groovy
// Jenkinsfile-deploy-frontend
pipeline {
    agent { label 'docker-agent' }

    tools {
        nodejs 'node-22'
    }

    environment {
        AWS_REGION     = 'us-east-1'
        ECR_REPOSITORY = 'full-stack-docker/doc-frontend'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Extract Version') {
            steps {
                script {
                    env.VERSION = env.TAG_NAME?.replaceFirst(/^v/, '') ?: sh(script: 'git describe --tags --abbrev=0 | sed "s/^v//"', returnStdout: true).trim()
                    env.COMMIT_SHA = sh(script: 'git rev-parse --short=8 HEAD', returnStdout: true).trim()
                    echo "Deploying version: ${env.VERSION} (commit: ${env.COMMIT_SHA})"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Check Formatting') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npx prettier --check "src/**/*.{ts,tsx,json,css}"'
                }
            }
        }

        stage('Type Check') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npx tsc --noEmit'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                    sh 'npm run test'
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'google-client-id', variable: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'backend-internal-url', variable: 'BACKEND_INTERNAL_URL')
                ]) {
                    script {
                        def accountId = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                        def registry = "${accountId}.dkr.ecr.${AWS_REGION}.amazonaws.com"

                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${registry}"

                        def backendUrl = env.BACKEND_INTERNAL_URL ?: 'http://backend:8080/api/v1'

                        sh """
                            docker build \
                                --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
                                --build-arg BACKEND_INTERNAL_URL=${backendUrl} \
                                -t ${registry}/${ECR_REPOSITORY}:${VERSION} \
                                -t ${registry}/${ECR_REPOSITORY}:${COMMIT_SHA} \
                                -f DocumentOrganiser-Frontend/document-organiser-frontend/Dockerfile \
                                DocumentOrganiser-Frontend/document-organiser-frontend/

                            docker push ${registry}/${ECR_REPOSITORY}:${VERSION}
                            docker push ${registry}/${ECR_REPOSITORY}:${COMMIT_SHA}
                        """

                        echo "✅ Frontend image pushed: ${registry}/${ECR_REPOSITORY}:${VERSION}"
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
            cleanWs()
        }
    }
}
```

---

## Jenkinsfile (Unified)

A single `Jenkinsfile` at the repo root using different agent labels per stage:

```groovy
// Jenkinsfile (unified master-slave)
pipeline {
    // Default agent for lightweight stages
    agent { label 'build-agent' }

    tools {
        jdk 'jdk-21'
        nodejs 'node-22'
    }

    environment {
        AWS_REGION  = 'us-east-1'
        ECR_REPO_BE = 'full-stack-docker/doc-backend'
        ECR_REPO_FE = 'full-stack-docker/doc-frontend'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
    }

    stages {
        stage('Detect Changes') {
            steps {
                script {
                    env.BACKEND_CHANGED  = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q 'DocumentOrganiser-Backend/' && echo true || echo false", returnStdout: true).trim()
                    env.FRONTEND_CHANGED = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q 'DocumentOrganiser-Frontend/' && echo true || echo false", returnStdout: true).trim()
                    env.IS_TAG           = (env.TAG_NAME != null) ? 'true' : 'false'
                }
            }
        }

        // ── CI: Parallel Backend + Frontend ──
        stage('CI') {
            parallel {
                stage('CI – Backend') {
                    when { expression { env.BACKEND_CHANGED == 'true' || env.IS_TAG == 'true' } }
                    agent { label 'build-agent' }
                    stages {
                        stage('Backend Build') {
                            steps {
                                dir('DocumentOrganiser-Backend') {
                                    sh 'chmod +x gradlew'
                                    sh './gradlew build --no-daemon -x test'
                                }
                            }
                        }
                        stage('Backend Test') {
                            environment { SPRING_PROFILES_ACTIVE = 'test' }
                            steps {
                                dir('DocumentOrganiser-Backend') {
                                    sh './gradlew test --no-daemon'
                                }
                            }
                            post {
                                always {
                                    junit allowEmptyResults: true, testResults: 'DocumentOrganiser-Backend/**/build/test-results/**/*.xml'
                                }
                            }
                        }
                    }
                }

                stage('CI – Frontend') {
                    when { expression { env.FRONTEND_CHANGED == 'true' || env.IS_TAG == 'true' } }
                    agent { label 'build-agent' }
                    stages {
                        stage('Frontend Install') {
                            steps {
                                dir('DocumentOrganiser-Frontend/document-organiser-frontend') { sh 'npm ci' }
                            }
                        }
                        stage('Frontend Lint & Check') {
                            steps {
                                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                                    sh 'npm run lint'
                                    sh 'npx prettier --check "src/**/*.{ts,tsx,json,css}"'
                                    sh 'npx tsc --noEmit'
                                }
                            }
                        }
                        stage('Frontend Build') {
                            environment { NEXT_TELEMETRY_DISABLED = '1' }
                            steps {
                                dir('DocumentOrganiser-Frontend/document-organiser-frontend') { sh 'npm run build' }
                            }
                        }
                    }
                }
            }
        }

        // ── Deploy (tag only) — runs on docker-agent ──
        stage('Deploy to ECR') {
            when { expression { env.IS_TAG == 'true' } }
            agent { label 'docker-agent' }
            stages {
                stage('Prepare') {
                    steps {
                        script {
                            env.VERSION    = env.TAG_NAME.replaceFirst(/^v/, '')
                            env.COMMIT_SHA = sh(script: 'git rev-parse --short=8 HEAD', returnStdout: true).trim()

                            // ECR login using instance profile
                            def accountId = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                            env.REGISTRY = "${accountId}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                            sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${env.REGISTRY}"
                        }
                    }
                }

                stage('Deploy Images') {
                    parallel {
                        stage('Deploy Backend Image') {
                            steps {
                                dir('DocumentOrganiser-Backend') {
                                    sh 'chmod +x gradlew && ./gradlew bootJar --no-daemon -x test'
                                }
                                sh """
                                    docker build \
                                        -t ${REGISTRY}/${ECR_REPO_BE}:${VERSION} \
                                        -t ${REGISTRY}/${ECR_REPO_BE}:${COMMIT_SHA} \
                                        -f DocumentOrganiser-Backend/Dockerfile DocumentOrganiser-Backend/
                                    docker push ${REGISTRY}/${ECR_REPO_BE}:${VERSION}
                                    docker push ${REGISTRY}/${ECR_REPO_BE}:${COMMIT_SHA}
                                """
                                echo "✅ Backend: ${REGISTRY}/${ECR_REPO_BE}:${VERSION}"
                            }
                        }

                        stage('Deploy Frontend Image') {
                            steps {
                                withCredentials([
                                    string(credentialsId: 'google-client-id', variable: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
                                    string(credentialsId: 'backend-internal-url', variable: 'BACKEND_INTERNAL_URL')
                                ]) {
                                    script {
                                        def backendUrl = env.BACKEND_INTERNAL_URL ?: 'http://backend:8080/api/v1'
                                        def feDir = 'DocumentOrganiser-Frontend/document-organiser-frontend'
                                        sh """
                                            docker build \
                                                --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
                                                --build-arg BACKEND_INTERNAL_URL=${backendUrl} \
                                                -t ${REGISTRY}/${ECR_REPO_FE}:${VERSION} \
                                                -t ${REGISTRY}/${ECR_REPO_FE}:${COMMIT_SHA} \
                                                -f ${feDir}/Dockerfile ${feDir}/
                                            docker push ${REGISTRY}/${ECR_REPO_FE}:${VERSION}
                                            docker push ${REGISTRY}/${ECR_REPO_FE}:${COMMIT_SHA}
                                        """
                                        echo "✅ Frontend: ${REGISTRY}/${ECR_REPO_FE}:${VERSION}"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
            cleanWs()
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check console output for details.'
        }
    }
}
```

---

## Security Hardening & Best Practices

### IAM Best Practices

| Practice | Details |
|---|---|
| **Use instance profiles over IAM users** | Attach `jenkins-agent-role` to EC2 instances; no long-lived keys |
| **Least privilege** | Scope ECR permissions to specific repository ARNs only |
| **Rotate credentials** | If using IAM user, rotate access keys every 90 days |
| **No `*` resources in production** | Replace `<ACCOUNT_ID>` with your actual account ID |
| **Enable CloudTrail** | Audit all ECR push/pull and EC2 operations |
| **Use VPC endpoints** | Create ECR VPC endpoint to avoid public internet for pushes |

### Jenkins Security

| Practice | Details |
|---|---|
| **Master runs 0 executors** | All builds execute on slaves only |
| **Enable CSRF protection** | Manage Jenkins → Security → CSRF Protection |
| **Matrix-based security** | Restrict who can configure jobs/nodes |
| **Agent → Master access control** | Manage Jenkins → Security → Agent → Controller → `Disabled` |
| **HTTPS** | Place Jenkins behind an ALB with ACM certificate or use nginx reverse proxy |
| **Private subnets for agents** | Agents in private subnet with NAT gateway for outbound |
| **Credential scoping** | Scope credentials to specific folders/jobs when possible |

### Network Security

```
┌─────────────────────────────────────┐
│           Public Subnet             │
│  ┌─────────────────────────────┐    │
│  │  ALB (HTTPS:443 → 8080)    │    │
│  └──────────┬──────────────────┘    │
│             │                       │
├─────────────┼───────────────────────┤
│           Private Subnet            │
│  ┌──────────▼──────────┐            │
│  │  Jenkins Master     │◄──SSH──┐   │
│  │  (no executors)     │        │   │
│  └─────────────────────┘        │   │
│                                 │   │
│  ┌─────────────────────┐        │   │
│  │  Jenkins Agent(s)   │────────┘   │
│  │  (build + docker)   │            │
│  └──────────┬──────────┘            │
│             │                       │
│  ┌──────────▼──────────┐            │
│  │  VPC Endpoint (ECR) │            │
│  └─────────────────────┘            │
└─────────────────────────────────────┘
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Agent shows **Offline** | Check SSH connectivity: `ssh -i key ubuntu@<IP>`, verify security groups |
| `docker: permission denied` | Run `sudo usermod -aG docker ubuntu` on agent, reconnect |
| `aws ecr get-login-password` fails | Verify IAM role is attached to agent EC2 instance: `aws sts get-caller-identity` |
| Gradle cache not persisting | Ensure `/home/ubuntu/jenkins-agent` has sufficient disk; check `cleanWs()` isn't removing caches |
| JNLP agent can't connect | Ensure port 50000 is open from agent SG → master SG |
| `No nodes with label 'build-agent'` | Check node labels in Manage Jenkins → Nodes; verify agent is online |
| Dynamic EC2 agents not launching | Check master IAM role has `ec2:RunInstances`, `iam:PassRole`; check subnet/SG |
| Node.js/JDK not found on agent | Install tools on agent via bootstrap script OR use Jenkins auto-installer |
| Build timeout | Increase `timeout()` in pipeline options; check agent resources |

---

## Reference: GitHub Actions → Jenkins Mapping

| GitHub Actions Concept | Jenkins Master–Slave Equivalent |
|---|---|
| `runs-on: ubuntu-latest` | `agent { label 'build-agent' }` on slave |
| `on: push/pull_request` | `triggers { pollSCM() }` or GitHub webhook |
| `on: push: tags: ["v*"]` | Multibranch tag discovery or `TAG_NAME` env |
| `paths:` filter | `git diff` changeset detection in script |
| `actions/checkout@v4` | Built-in SCM checkout (runs on slave) |
| `actions/setup-java@v4` | `tools { jdk 'jdk-21' }` (auto-installed on slave) |
| `actions/setup-node@v4` | `tools { nodejs 'node-22' }` (auto-installed on slave) |
| `actions/cache@v4` | Gradle/npm caches persist on slave disk |
| `secrets.X` | `withCredentials([...])` (master stores, slave uses) |
| `needs: job` | Sequential `stages` or `parallel` blocks |
| `strategy.matrix` | `matrix` directive in declarative pipeline |
| Parallel jobs | `parallel { stage('A') {...} stage('B') {...} }` on separate agents |
| `$GITHUB_STEP_SUMMARY` | `echo` in console / Badge plugin |
| GitHub-hosted runners | Jenkins slave EC2 instances (permanent or dynamic) |
