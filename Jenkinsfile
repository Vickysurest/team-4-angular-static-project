pipeline {
    agent any

    parameters {
        string(name: 'VERSION', defaultValue: 'v1.0.0', description: 'Version to build or deploy')
        booleanParam(name: 'ROLLBACK', defaultValue: false, description: 'Set to true to rollback to previous version (skip build & test)')
    }

    environment {
        REPO_URL = 'https://github.com/Vickysurest/team-4-angular-static-project.git'
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📥 Cloning repository from ${REPO_URL}"
                git url: "${env.REPO_URL}", branch: 'dev'
                sh 'ls -la'
            }
        }

        stage('Build') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🔧 Running build playbook for version ${params.VERSION}"
                sh '''
                    ansible-playbook -i hosts.ini build.yml -e "version=${VERSION}"
                '''
            }
        }

        stage('Test') {
            when { expression { return !params.ROLLBACK } }
            steps {
                echo "🧪 Running test playbook..."
                sh '''
                    ansible-playbook -i hosts.ini test.yml
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Running deployment playbook for version ${params.VERSION}"
                sh '''
                    ansible-playbook -i hosts.ini deploy.yml -e "version=${VERSION}"
                '''
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
    }
}
