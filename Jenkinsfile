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

    stage('Install Node Modules and Jest') {
        when { expression { return !params.ROLLBACK } }
        steps {
            echo "📦 Installing npm dependencies including Jest"
            sh """
                cd ${env.WORKSPACE}
                npm install
                npm install --save-dev jest @types/jest jest-preset-angular ts-jest
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
            echo "🧪 Running test playbook..."
            sh """
                export ANSIBLE_COLLECTIONS_PATHS=${env.ANSIBLE_COLLECTIONS_PATHS}
                ansible-playbook -i ${env.INVENTORY_PATH} /var/lib/jenkins/ansible/test.yml \
                -e project_dir='${env.WORKSPACE}'
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
