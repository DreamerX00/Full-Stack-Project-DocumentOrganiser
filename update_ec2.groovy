import jenkins.model.Jenkins
import hudson.plugins.ec2.EC2Cloud

def jenkins = Jenkins.getInstance()
def cloud = jenkins.clouds.get(0)
if (cloud instanceof EC2Cloud) {
    def templates = cloud.getTemplates()
    templates.each { t ->
        t.connectBySSHProcess = true
        println "Updated template: " + t.description
    }
    jenkins.save()
    println "Saved Jenkins configuration."
}
