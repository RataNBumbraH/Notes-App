@Library("Shared") _
pipeline {
    agent {label 'ratan'}

    stages {
        stage('Hello'){
            steps{
                script{
                   hello()
                }
            }
        }
        stage('Code') {
            steps {
                script{
                    clone('https://github.com/RataNBumbraH/Notes-App.git','main')
                }
            }
        }
        stage('Build') {
            steps {
                echo 'Code Building'
                sh 'docker compose down && docker compose up -d --build'
            }
        }
        stage('Pushing dockerhub') {
            steps {
                echo 'Push to DockerHub'
                docker_push('notes-cicd-frontend','latest','ratanbumbrah')
                docker_push('notes-cicd-backend','latest','ratanbumbrah')
                }
            }
        stage('Deploy') {
            steps {
                echo 'Code Deploying'
            }
        }
    }
}
