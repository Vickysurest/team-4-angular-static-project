pipeline {
    agent any

    parameters {
        string(name: 'VERSION', defaultValue: 'v1.0.0', description: 'Version to build or deploy')
        booleanParam(name: 'ROLLBACK', defaultValue: false, description: 'Set to true to rollback to previous version (skip build & test)')
    }

    environment {
        REPO_URL = 'https://github.com/Vickysurest/team-4-angular-static-project.git'
        WORKSPACE_DIR = '.'   // default workspace
    }

    stages {
        stage('Checkout') {
            steps {
                // Clone the repo
                git url: "${env.REPO_URL}", branch: 'dev'
            }
        }

        stage('Build') {
            when { expression { return !params.ROLLBACK } }
            steps {
                script {
                    // run the build playbook
                    sh """
                        ansible-playbook hosts.ini build.yml -e version=${params.VERSION}
                    """
                }
            }
        }

        stage('Test') {
            when { expression { return !params.ROLLBACK } }
            steps {
                script {
                    sh """
                        ansible-playbook hosts.ini test.yml
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                        ansible-playbook hosts.ini deploy.yml -e version=${params.VERSION}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline successful for version ${params.VERSION}."
        }
        failure {
            echo "❌ Pipeline failed. Check the logs for errors."
        }
    }
}
