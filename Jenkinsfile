pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git 'https://github.com/mohinimutyala/Fleet_Management.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'sudo docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'sudo docker compose up -d'
            }
        }
    }
}