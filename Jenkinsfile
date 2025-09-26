pipeline {
    agent any

    parameters {
        string(name: 'VERSION', defaultValue: 'v1.0.0', description: 'Version to build or deploy')
        booleanParam(name: 'ROLLBACK', defaultValue: false, description: 'Set to true to rollback to previous version (skip build & test)')
    }

    environment {
        REPO_URL = 'https://github.com/Vickysurest/team-4-angular-static-project.git'
        ANSIBLE_HOST_KEY_CHECKING = 'False'  // Prevent "host key verification failed"
        INVENTORY_PATH = '/home/ec2-user/ansible/hosts.ini'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Cloning repository from ${env.REPO_URL}"
                git url: "${env.REPO_URL}", branch: 'dev'
                sh 'ls -la'
            }
        }

        stage('Prepare Ansible Files') {
            steps {
                echo "📂 Copying Ansible files to permanent directory"
                sh """
                    mkdir -p /home/ec2-user/ansible
                    cp hosts.ini /home/ec2-user/ansible/hosts.ini
                    cp build.yml /home/ec2-user/ansible/
                    cp test.yml /home/ec2-user/ansible/
                    cp deploy.yml /home/ec2-user/ansible/
                """
            }
        }

        stage('Verify Ansible Inventory') {
            steps {
                echo "🔍 Verifying inventory and playbooks"
                sh 'ls -l /home/ec2-user/ansible/'
            }
        }

        stage('Build') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🔧 Running build playbook for version ${params.VERSION}"
                sh """
                    set -e
                    ansible-playbook -i ${env.INVENTORY_PATH} /home/ec2-user/ansible/build.yml -e version=${params.VERSION}
                """
            }
        }

        stage('Test') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🧪 Running test playbook..."
                sh """
                    set -e
                    ansible-playbook -i ${env.INVENTORY_PATH} /home/ec2-user/ansible/test.yml
                """
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Running deployment playbook for version ${params.VERSION}"
                sh """
                    set -e
                    ansible-playbook -i ${env.INVENTORY_PATH} /home/ec2-user/ansible/deploy.yml -e version=${params.VERSION}
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully for version ${params.VERSION}."
        }
        failure {
            echo "❌ Pipeline failed for version ${params.VERSION}. Please check logs above."
        }
        always {
            echo "🧹 Cleaning up workspace (not Ansible dir)..."
            cleanWs()
        }
    }
}
