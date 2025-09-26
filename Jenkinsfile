pipeline {
    agent any

    parameters {
        string(name: 'VERSION', defaultValue: 'v1.0.0', description: 'Version to build or deploy')
        booleanParam(name: 'ROLLBACK', defaultValue: false, description: 'Set to true to rollback to previous version (skip build & test)')
    }

    environment {
        REPO_URL = 'https://github.com/Vickysurest/team-4-angular-static-project.git'
        ANSIBLE_HOST_KEY_CHECKING = 'False'
        INVENTORY_PATH = '/var/lib/jenkins/ansible/hosts.ini'
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
                echo "📂 Copying Ansible files to /var/lib/jenkins/ansible"
                sh """
                    mkdir -p /var/lib/jenkins/ansible
                    cp hosts.ini /var/lib/jenkins/ansible/hosts.ini
                    cp build.yml /var/lib/jenkins/ansible/
                    cp test.yml /var/lib/jenkins/ansible/
                    cp deploy.yml /var/lib/jenkins/ansible/
                """
            }
        }

        stage('Verify Ansible Inventory') {
            steps {
                echo "🔍 Verifying Ansible files"
                sh 'ls -l /var/lib/jenkins/ansible/'
            }
        }

        stage('Build') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🔧 Running build playbook for version ${params.VERSION}"
                sh """
                    ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/build.yml -e version=${params.VERSION}
                """
            }
        }

        stage('Test') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🧪 Running test playbook..."
                sh """
                    ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/test.yml
                """
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Running deployment playbook for version ${params.VERSION}"
                sh """
                    ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/deploy.yml -e version=${params.VERSION}
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
            echo "🧹 Cleaning up workspace (but keeping Ansible files)..."
            cleanWs()
        }
    }
}
