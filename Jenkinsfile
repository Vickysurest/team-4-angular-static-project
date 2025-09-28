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
        ANSIBLE_COLLECTIONS_PATHS = "${HOME}/.ansible/collections:/usr/share/ansible/collections"
    }

    stages {
        stage('Clean Workspace Before Checkout') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🧼 Cleaning workspace before fresh checkout..."
                cleanWs()
            }
        }

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

        stage('Install Ansible Collections') {
            steps {
                echo "📦 Installing required Ansible collections"
                sh 'ansible-galaxy collection install community.general --force'
            }
        }

        stage('Debug Ansible Config') {
            steps {
                echo "🔧 Dumping Ansible config (for troubleshooting)"
                sh 'ansible-config dump | grep COLLECTIONS'
            }
        }

        stage('Verify Ansible Inventory') {
            steps {
                echo "🔍 Verifying Ansible files"
                sh 'ls -l /var/lib/jenkins/ansible/'
            }
        }

        stage('Setup Jest') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🧪 Installing Jest and related dependencies..."
                sh """
                    cd ${env.WORKSPACE}
                    npm install --legacy-peer-deps --save-dev jest ts-jest @types/jest@latest jest-preset-angular
                """
            }
        }

        stage('Build') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🔧 Running build playbook for version ${params.VERSION}"
                sh """
                    export ANSIBLE_COLLECTIONS_PATHS=${env.ANSIBLE_COLLECTIONS_PATHS}
                    ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/build.yml \
                    -e version=${params.VERSION} \
                    -e project_dir='${env.WORKSPACE}'
                """
            }
        }

        stage('Test') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🧪 Running test playbook using Jest..."
                sh """
                    export ANSIBLE_COLLECTIONS_PATHS=${env.ANSIBLE_COLLECTIONS_PATHS}
                    ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/test.yml \
                    -e project_dir='${env.WORKSPACE}'
                """
            }
        }

        stage('Copy Artifact to Deploy Servers') {
            steps {
                echo "📤 Copying artifact to deploy server(s)..."
                sh """
                    ARTIFACT="${env.WORKSPACE}/angular-devops-${params.VERSION}.tar.gz"
                    DEPLOY_HOSTS=\$(ansible -i ${env.INVENTORY_PATH} webservers --list-hosts | tail -n +2 | tr -d ' ')
                    for host in \$DEPLOY_HOSTS; do
                        echo "Copying artifact to \$host"
                        scp \$ARTIFACT \$host:/tmp/
                    done
                """
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Running deployment playbook for version ${params.VERSION}"
                sh """
                    export ANSIBLE_COLLECTIONS_PATHS=${env.ANSIBLE_COLLECTIONS_PATHS}
                    ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/deploy.yml \
                    -e version=${params.VERSION}
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully for version ${params.VERSION}."
        }
        failure {
            echo "❌ Pipeline failed for version ${params.VERSION}. Cleaning up artifacts to save disk space..."
            sh """
                echo '🗑️ Deleting logs, node_modules, dist folders...'
                find ${env.WORKSPACE} -type d \\( -name 'node_modules' -o -name 'dist' -o -name 'logs' \\) -exec rm -rf {} +
                echo '🧹 Temporary cleanup done.'
            """
        }
        always {
            echo "🧹 Final cleanup: cleaning workspace (excluding Ansible files)..."
            cleanWs()
        }
    }
}
