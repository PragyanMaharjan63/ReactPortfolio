// Build and deploy the MERN portfolio on the Jenkins host with Docker Compose.
//
// Layout this pipeline expects:
//   ./client  ./server  ./scripts  ./Dockerfile  ./compose.yaml
//
// Deployment: the image is built locally and run via `docker compose`.
// Nothing is pushed to a registry, so no `docker login` and no registry
// credentials. Jenkins is assumed to be in the docker group — no sudo.

/** Roll back to the previous image after a failed verification. */
void rollback() {
    echo '--- Rolling back to the previous image ---'
    sh script: """
        set +e
        if docker image inspect '${env.IMAGE_NAME}:${env.ROLLBACK_TAG}' >/dev/null 2>&1; then
            docker tag '${env.IMAGE_NAME}:${env.ROLLBACK_TAG}' '${env.IMAGE_NAME}:latest'
            docker compose -f compose.yaml up -d --no-build app
            echo 'Previous image redeployed.'
        else
            echo 'No previous image exists - nothing to roll back to.'
        fi
        exit 0
    """, returnStatus: true
}

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        skipDefaultCheckout(true)
    }

    environment {
        APP_NAME       = 'portfolio'
        IMAGE_NAME     = 'maharjan-pragyan-portfolio'
        CONTAINER_NAME = 'portfolio-app'

        HOST_PORT      = '6767'
        CONTAINER_PORT = '3000'
        HEALTH_URL     = "http://127.0.0.1:${HOST_PORT}/api/health"

        ROLLBACK_TAG = 'rollback'
        NODE_IMAGE   = 'node:22-alpine'

        SITE_URL = 'https://maharjanpragyan.com.np'
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    // Uses the credentials Jenkins already holds for this job,
                    // so a private repository works with nothing hardcoded.
                    def vars = checkout scm
                    env.GIT_SHA = (vars.GIT_COMMIT ?: 'unknown').take(7)
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"
                    echo "Building ${env.IMAGE_NAME}:${env.IMAGE_TAG} (${env.GIT_SHA})"
                }
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    set -eu
                    docker --version
                    docker compose version
                    docker info --format 'Server {{.ServerVersion}}'

                    missing=0
                    for f in package.json package-lock.json Dockerfile compose.yaml \
                             client/package.json server/package.json \
                             client/src/main.tsx server/src/index.ts; do
                        [ -f "$f" ] || { echo "ERROR: missing $f" >&2; missing=1; }
                    done
                    [ "$missing" -eq 0 ] || exit 1
                    echo "Source layout validated."
                '''
            }
        }

        stage('Install') {
            steps {
                // Runs in the same Node image the Dockerfile builds with, so the
                // agent needs only Docker.
                sh '''
                    set -eu
                    docker run --rm -v "$PWD":/app -w /app "${NODE_IMAGE}" \
                        npm ci --include=dev --no-audit --no-fund
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    set -eu
                    docker run --rm -v "$PWD":/app -w /app "${NODE_IMAGE}" npm run lint
                '''
            }
        }

        stage('Type Check') {
            steps {
                sh '''
                    set -eu
                    docker run --rm -v "$PWD":/app -w /app "${NODE_IMAGE}" npm run type-check
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eu
                    docker run --rm -v "$PWD":/app -w /app "${NODE_IMAGE}" npm run build
                    test -f client/dist/index.html || { echo "ERROR: client build produced no index.html" >&2; exit 1; }
                    test -f server/dist/index.js   || { echo "ERROR: server build produced no index.js" >&2; exit 1; }
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    set -eu
                    # Keep the currently deployed image as the rollback target
                    # BEFORE the tag is moved to the new build.
                    if docker image inspect "${IMAGE_NAME}:latest" >/dev/null 2>&1; then
                        docker tag "${IMAGE_NAME}:latest" "${IMAGE_NAME}:${ROLLBACK_TAG}"
                        echo "Rollback point saved."
                    else
                        echo "No previous image - first deploy."
                    fi

                    docker build \
                        --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
                        --tag "${IMAGE_NAME}:${GIT_SHA}" \
                        --tag "${IMAGE_NAME}:latest" \
                        --file Dockerfile \
                        .
                '''
            }
        }

        stage('Deploy') {
            steps {
                script { env.DEPLOY_STARTED = 'true' }
                sh '''
                    set -eu
                    # --no-build: deploy exactly the image just verified above.
                    SITE_URL="${SITE_URL}" docker compose -f compose.yaml up -d --no-build
                    docker compose -f compose.yaml ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    sh '''
                        set -eu
                        i=1
                        while [ "$i" -le 20 ]; do
                            state=$(docker inspect -f '{{.State.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo missing)
                            if [ "$state" != "running" ]; then
                                echo "ERROR: container state is '$state'." >&2
                                exit 1
                            fi

                            if curl --fail --silent --max-time 5 "${HEALTH_URL}" >/dev/null; then
                                echo "Health check passed on attempt $i."
                                curl --silent "${HEALTH_URL}"; echo
                                # The API being up is not enough - the SPA must
                                # actually be served.
                                curl --fail --silent --max-time 5 "http://127.0.0.1:${HOST_PORT}/" >/dev/null \
                                    && echo "Document served." && exit 0
                                echo "ERROR: / did not respond." >&2
                                exit 1
                            fi

                            echo "Attempt $i/20 failed; retrying in 5s..."
                            i=$((i + 1))
                            sleep 5
                        done

                        echo "ERROR: ${HEALTH_URL} never became healthy." >&2
                        exit 1
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    set -eu
                    # Dangling layers only. Tagged images - including the
                    # rollback target - are untouched, so this can never remove
                    # a working deployment. No `system prune -a`.
                    docker image prune --force >/dev/null 2>&1 || true
                    docker images "${IMAGE_NAME}" --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully."
        }
        failure {
            script {
                if (env.DEPLOY_STARTED == 'true') {
                    echo '--- Container logs ---'
                    sh script: """
                        docker compose -f compose.yaml logs --tail 120 app 2>&1
                        exit 0
                    """, returnStatus: true
                    rollback()
                }
                echo "Deployment failed."
            }
        }
        always {
            cleanWs()
        }
    }
}
