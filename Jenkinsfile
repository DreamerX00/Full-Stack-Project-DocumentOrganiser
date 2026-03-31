pipeline {
    agent { label 'docker-agent' }

    environment {
        AWS_REGION       = 'us-east-1'
        ECR_REPO_BE      = 'full-stack-docker/doc-backend'
        ECR_REPO_FE      = 'full-stack-docker/doc-frontend'
        DOCKER_BUILDKIT  = '1'
    }

    options {
        skipDefaultCheckout(false)
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
    }

    stages {

        stage('Detect Changes') {
            steps {
                script {
                    // Handle shallow clones or first commit
                    sh 'git fetch --depth=2 origin $(echo $GIT_BRANCH | sed "s|origin/||") || true'
                    def hasParent = sh(script: 'git rev-parse --verify HEAD~1 >/dev/null 2>&1', returnStatus: true) == 0
                    if (hasParent) {
                        env.BACKEND_CHANGED  = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q 'DocumentOrganiser-Backend/' && echo true || echo false", returnStdout: true).trim()
                        env.FRONTEND_CHANGED = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q 'DocumentOrganiser-Frontend/' && echo true || echo false", returnStdout: true).trim()
                    } else {
                        echo 'No parent commit found — building everything'
                        env.BACKEND_CHANGED  = 'true'
                        env.FRONTEND_CHANGED = 'true'
                    }
                    env.IS_TAG = (env.TAG_NAME != null) ? 'true' : 'false'
                    echo "Backend changed: ${env.BACKEND_CHANGED} | Frontend changed: ${env.FRONTEND_CHANGED} | Is tag: ${env.IS_TAG}"
                }
            }
        }

        // ── CI: Parallel Backend + Frontend ──
        stage('CI') {
            parallel {

                stage('CI – Backend') {
                    when {
                        beforeAgent true
                        expression { env.BACKEND_CHANGED == 'true' || env.IS_TAG == 'true' }
                    }
                    agent { label 'jenkins-agent-ec2' }
                    stages {
                        stage('Backend Build') {
                            steps {
                                dir('DocumentOrganiser-Backend') {
                                    sh 'chmod +x gradlew && ./gradlew build --no-daemon -x test'
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
                                    junit allowEmptyResults: true, testResults: '**/build/test-results/**/*.xml'
                                }
                            }
                        }
                    }
                    post { always { cleanWs() } }
                }

                stage('CI – Frontend') {
                    when {
                        beforeAgent true
                        expression { env.FRONTEND_CHANGED == 'true' || env.IS_TAG == 'true' }
                    }
                    agent { label 'jenkins-agent-ec2' }
                    stages {
                        stage('Frontend Install') {
                            steps {
                                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                                    sh 'npm ci'
                                }
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
                                dir('DocumentOrganiser-Frontend/document-organiser-frontend') {
                                    sh 'npm run build'
                                }
                            }
                        }
                    }
                    post { always { cleanWs() } }
                }
            }
        }

        // ── Deploy (tag builds only) ──
        stage('Deploy to ECR') {
            when {
                beforeAgent true
                expression { env.IS_TAG == 'true' }
            }
            agent { label 'docker-agent' }
            stages {
                stage('ECR Login') {
                    steps {
                        script {
                            env.VERSION    = env.TAG_NAME.replaceFirst(/^v/, '')
                            env.COMMIT_SHA = sh(script: 'git rev-parse --short=8 HEAD', returnStdout: true).trim()
                            def accountId  = sh(script: 'aws sts get-caller-identity --query Account --output text', returnStdout: true).trim()
                            env.REGISTRY   = "${accountId}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                            sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${env.REGISTRY}"
                        }
                    }
                }

                stage('Build & Push Images') {
                    parallel {
                        stage('Backend Image') {
                            steps {
                                dir('DocumentOrganiser-Backend') {
                                    sh 'chmod +x gradlew && ./gradlew bootJar --no-daemon -x test'
                                }
                                sh """
                                    docker build \
                                        -t ${REGISTRY}/${ECR_REPO_BE}:${VERSION} \
                                        -t ${REGISTRY}/${ECR_REPO_BE}:${COMMIT_SHA} \
                                        -t ${REGISTRY}/${ECR_REPO_BE}:latest \
                                        -f DocumentOrganiser-Backend/Dockerfile DocumentOrganiser-Backend/
                                    docker push ${REGISTRY}/${ECR_REPO_BE}:${VERSION}
                                    docker push ${REGISTRY}/${ECR_REPO_BE}:${COMMIT_SHA}
                                    docker push ${REGISTRY}/${ECR_REPO_BE}:latest
                                """
                                echo "Backend pushed: ${REGISTRY}/${ECR_REPO_BE}:${VERSION}"
                            }
                        }

                        stage('Frontend Image') {
                            steps {
                                withCredentials([
                                    string(credentialsId: 'google-client-id',    variable: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
                                    string(credentialsId: 'backend-internal-url', variable: 'BACKEND_INTERNAL_URL')
                                ]) {
                                    script {
                                        def backendUrl = env.BACKEND_INTERNAL_URL ?: 'http://backend:8080/api/v1'
                                        def feDir      = 'DocumentOrganiser-Frontend/document-organiser-frontend'
                                        sh """
                                            docker build \
                                                --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
                                                --build-arg BACKEND_INTERNAL_URL=${backendUrl} \
                                                -t ${REGISTRY}/${ECR_REPO_FE}:${VERSION} \
                                                -t ${REGISTRY}/${ECR_REPO_FE}:${COMMIT_SHA} \
                                                -t ${REGISTRY}/${ECR_REPO_FE}:latest \
                                                -f ${feDir}/Dockerfile ${feDir}/
                                            docker push ${REGISTRY}/${ECR_REPO_FE}:${VERSION}
                                            docker push ${REGISTRY}/${ECR_REPO_FE}:${COMMIT_SHA}
                                            docker push ${REGISTRY}/${ECR_REPO_FE}:latest
                                        """
                                        echo "Frontend pushed: ${REGISTRY}/${ECR_REPO_FE}:${VERSION}"
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
        success { echo 'Pipeline completed successfully!' }
        failure { echo 'Pipeline failed. Check console output for details.' }
    }
}
