// Declarative pipeline: build the portfolio image on the Jenkins host and run
// it there as a container.
//
// Repository layout this pipeline expects:
//
//   ./package.json  ./package-lock.json  ./index.html  ./vite.config.js
//   ./eslint.config.js
//   ./Dockerfile    ./.dockerignore      ./Caddyfile
//   ./public/       (penguin.png, icons/, projectImages/)
//   ./src/          (main.jsx, App.jsx, index.css, components/)
//
// Deployment model: the image is built locally and run with `docker run`.
// Nothing is pushed to a registry and no `docker login` is performed. There
// is no docker-compose file in this repository to preserve.
//
// Configuration: src/components/contact.jsx reads
// `import.meta.env.VITE_FORMSPREE_ID`, which Vite inlines at BUILD time. It
// is therefore a --build-arg, not a container env var. It is a public value
// (it ships inside the JS bundle), so it is a plain build parameter rather
// than a Jenkins credential. No .env file is created or read.

/**
 * Build the image, taking VITE_FORMSPREE_ID from either $FORMSPREE_ID (set
 * from the build parameter) or $ENV_FILE (the .env supplied by the Jenkins
 * credential). Tracing is disabled around the value so it never lands in the
 * console log.
 */
void buildImage() {
    sh '''
        set -eu
        set +x

        # A .env file is KEY=value, so sourcing it in a subshell lets the
        # shell handle quoting instead of a fragile parser.
        if [ -z "${FORMSPREE_ID:-}" ] && [ -n "${ENV_FILE:-}" ] && [ -f "${ENV_FILE}" ]; then
            FORMSPREE_ID=$( . "${ENV_FILE}" >/dev/null 2>&1; printf %s "${VITE_FORMSPREE_ID:-}" )
        fi
        FORMSPREE_ID="${FORMSPREE_ID:-}"

        if [ -z "${FORMSPREE_ID}" ]; then
            echo "NOTE: VITE_FORMSPREE_ID is empty; the contact form will be disabled."
        else
            echo "VITE_FORMSPREE_ID resolved (${#FORMSPREE_ID} chars); contact form enabled."
        fi

        docker build \
            --build-arg VITE_FORMSPREE_ID="${FORMSPREE_ID}" \
            --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
            --tag "${IMAGE_NAME}:${GIT_SHA}" \
            --file Dockerfile \
            .

        docker image inspect "${IMAGE_NAME}:${IMAGE_TAG}" \
            --format 'Built {{.RepoTags}} - size {{.Size}} bytes'
    '''
}

/** Restore the previously running container/image after a failed deploy. */
void rollback() {
    echo '--- Rolling back to the previous deployment ---'
    sh script: """
        set +e
        # Drop the container that failed verification.
        docker rm -f '${env.CONTAINER_NAME}' >/dev/null 2>&1

        if docker container inspect '${env.PREVIOUS_CONTAINER}' >/dev/null 2>&1; then
            docker rename '${env.PREVIOUS_CONTAINER}' '${env.CONTAINER_NAME}'
            docker start '${env.CONTAINER_NAME}'
            echo 'Previous container restored.'
        elif docker image inspect '${env.IMAGE_NAME}:${env.ROLLBACK_TAG}' >/dev/null 2>&1; then
            docker run -d \
                --name '${env.CONTAINER_NAME}' \
                --restart unless-stopped \
                --publish '${env.HOST_PORT}:${env.CONTAINER_PORT}' \
                '${env.IMAGE_NAME}:${env.ROLLBACK_TAG}'
            echo 'Previous image redeployed.'
        else
            echo 'No previous deployment exists - nothing to roll back to.'
        fi
        exit 0
    """, returnStatus: true
}

pipeline {
    agent any

    options {
        // Two deploys must never race for the same container name and port.
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '5'))
        skipDefaultCheckout(true)
    }

    parameters {
        string(
            name: 'VITE_FORMSPREE_ID',
            defaultValue: '',
            description: 'Formspree form ID (the <id> in https://formspree.io/f/<id>). ' +
                         'Inlined into the JS bundle at build time, so it is public, not a secret. ' +
                         'Leave blank to deploy with the contact form disabled.'
        )
        booleanParam(
            name: 'RUN_LINT',
            defaultValue: true,
            description: 'Run `npm run lint` before building the image.'
        )
    }

    environment {
    APP_NAME           = 'react-portfolio'
    IMAGE_NAME         = 'react-portfolio'
    CONTAINER_NAME     = 'react-portfolio'
    PREVIOUS_CONTAINER = 'react-portfolio-previous'

    HOST_PORT      = '9866'
    CONTAINER_PORT = '9866'

    HEALTH_URL     = "http://127.0.0.1:${HOST_PORT}/healthz"
    HEALTH_RETRIES = '20'
    HEALTH_DELAY   = '3'

    ROLLBACK_TAG = 'rollback'
    STABLE_TAG   = 'current'

    ENV_CREDENTIAL_ID = 'pragyan-Portfolio-Env'
    NODE_IMAGE = 'node:22-alpine'
}

    stages {

        stage('Checkout') {
            steps {
                script {
                    // Reuses the credentials Jenkins already holds for this
                    // job. Nothing is hardcoded here.
                    def vars = checkout scm
                    env.GIT_SHA = (vars.GIT_COMMIT ?: 'unknown').take(7)
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"
                    echo "Building ${env.IMAGE_NAME}:${env.IMAGE_TAG} from commit ${env.GIT_SHA}"
                }
            }
        }

        stage('Validate environment') {
            steps {
                sh '''
                    set -eu
                    echo "--- Docker ---"
                    docker --version
                    docker info --format 'Server {{.ServerVersion}} / storage {{.Driver}}'

                    echo "--- HTTP client ---"
                    if command -v curl >/dev/null 2>&1; then
                        echo "curl: $(curl --version | head -n1)"
                    elif command -v wget >/dev/null 2>&1; then
                        echo "wget available"
                    else
                        echo "ERROR: neither curl nor wget is installed on this agent." >&2
                        exit 1
                    fi
                '''
            }
        }

        stage('Validate source') {
            steps {
                sh '''
                    set -eu
                    missing=0

                    # Files the Docker build reads, in the layout it expects.
                    for f in package.json package-lock.json index.html vite.config.js \
                             Dockerfile .dockerignore Caddyfile \
                             src/main.jsx src/App.jsx src/index.css; do
                        if [ ! -f "$f" ]; then
                            echo "ERROR: required file missing: $f" >&2
                            missing=1
                        fi
                    done

                    for d in src/components public; do
                        if [ ! -d "$d" ]; then
                            echo "ERROR: required directory missing: $d" >&2
                            missing=1
                        fi
                    done

                    [ "$missing" -eq 0 ] || exit 1

                    echo "Components: $(find src/components -name '*.jsx' | wc -l) jsx files"
                    echo "Public assets: $(find public -type f | wc -l) files"
                    echo "Lockfile: $(wc -l < package-lock.json) lines"

                    # package.json and package-lock.json must agree or `npm ci`
                    # fails inside the image with a confusing error.
                    if ! grep -q '"lockfileVersion"' package-lock.json; then
                        echo "ERROR: package-lock.json looks malformed." >&2
                        exit 1
                    fi

                    echo "Source layout validated."
                '''
            }
        }

        stage('Lint') {
            when { expression { return params.RUN_LINT } }
            steps {
                // Run in the same Node image the Dockerfile builds with, so the
                // agent does not need Node installed. Nothing is written back
                // into the workspace except node_modules, which .dockerignore
                // keeps out of the build context.
                sh '''
                    set -eu
                    docker run --rm \
                        -v "$PWD":/app \
                        -w /app \
                        "${NODE_IMAGE}" \
                        sh -c "npm ci --include=dev --no-audit --no-fund && npm run lint"
                '''
            }
        }

        stage('Build image') {
            steps {
                script {
                    // A value typed into the build parameter wins; otherwise
                    // the .env comes from the Jenkins credential.
                    if (params.VITE_FORMSPREE_ID?.trim()) {
                        echo 'Using VITE_FORMSPREE_ID from the build parameter.'
                        withEnv(["FORMSPREE_ID=${params.VITE_FORMSPREE_ID.trim()}"]) {
                            buildImage()
                        }
                    } else {
                        echo "Loading .env from credential '${env.ENV_CREDENTIAL_ID}'."
                        withCredentials([
                            file(credentialsId: env.ENV_CREDENTIAL_ID, variable: 'ENV_FILE')
                        ]) {
                            buildImage()
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script { env.DEPLOY_STARTED = 'true' }
                sh '''
                    set -eu

                    # Preserve the currently working image as the rollback
                    # target BEFORE anything is torn down.
                    if docker image inspect "${IMAGE_NAME}:${STABLE_TAG}" >/dev/null 2>&1; then
                        docker tag "${IMAGE_NAME}:${STABLE_TAG}" "${IMAGE_NAME}:${ROLLBACK_TAG}"
                        echo "Rollback point saved from ${IMAGE_NAME}:${STABLE_TAG}"
                    else
                        echo "No previous stable image - this is the first deploy."
                    fi

                    # Clear any holding container left by an earlier failure.
                    docker rm -f "${PREVIOUS_CONTAINER}" >/dev/null 2>&1 || true

                    # Park the running container instead of deleting it, so it
                    # can be restored instantly if verification fails.
                    if docker container inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
                        docker stop "${CONTAINER_NAME}" >/dev/null
                        docker rename "${CONTAINER_NAME}" "${PREVIOUS_CONTAINER}"
                        echo "Existing container parked as ${PREVIOUS_CONTAINER}"
                    fi

                    docker run -d \
                        --name "${CONTAINER_NAME}" \
                        --restart unless-stopped \
                        --publish "${HOST_PORT}:${CONTAINER_PORT}" \
                        --label "app=${APP_NAME}" \
                        --label "build=${BUILD_NUMBER}" \
                        --label "commit=${GIT_SHA}" \
                        "${IMAGE_NAME}:${IMAGE_TAG}"

                    echo "Started ${CONTAINER_NAME} from ${IMAGE_NAME}:${IMAGE_TAG}"
                '''
            }
        }

        stage('Health verification') {
            steps {
                sh '''
                    set -eu

                    probe() {
                        if command -v curl >/dev/null 2>&1; then
                            curl --fail --silent --show-error --max-time 5 "$1" >/dev/null
                        else
                            wget --quiet --tries=1 --timeout=5 --spider "$1"
                        fi
                    }

                    i=1
                    while [ "$i" -le "${HEALTH_RETRIES}" ]; do
                        # A container that exited will never become healthy.
                        state=$(docker inspect -f '{{.State.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo missing)
                        if [ "$state" != "running" ]; then
                            echo "ERROR: container state is '$state' after $i attempt(s)." >&2
                            exit 1
                        fi

                        if probe "${HEALTH_URL}"; then
                            echo "Health check passed on attempt $i (${HEALTH_URL})"
                            # The health route is static; confirm the SPA entry
                            # document is served too.
                            probe "http://127.0.0.1:${HOST_PORT}/" \
                                && echo "Index document served." \
                                || { echo "ERROR: / did not respond." >&2; exit 1; }
                            exit 0
                        fi

                        echo "Attempt $i/${HEALTH_RETRIES} failed; retrying in ${HEALTH_DELAY}s..."
                        i=$((i + 1))
                        sleep "${HEALTH_DELAY}"
                    done

                    echo "ERROR: ${HEALTH_URL} never became healthy." >&2
                    exit 1
                '''
            }
        }

        stage('Promote') {
            steps {
                sh '''
                    set -eu
                    # Verified: this image becomes the stable one.
                    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${IMAGE_NAME}:${STABLE_TAG}"
                    echo "Promoted ${IMAGE_NAME}:${IMAGE_TAG} to ${IMAGE_NAME}:${STABLE_TAG}"
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    set -eu
                    # Only now is the old container expendable.
                    docker rm -f "${PREVIOUS_CONTAINER}" >/dev/null 2>&1 || true

                    # Untagged layers only. The rollback and stable tags keep
                    # their images alive, so this cannot delete a working
                    # deployment.
                    docker image prune --force >/dev/null 2>&1 || true

                    echo "--- Deployed containers ---"
                    docker ps --filter "label=app=${APP_NAME}" \
                        --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
                '''
            }
        }
    }

    post {
        failure {
            script {
                if (env.DEPLOY_STARTED == 'true') {
                    echo '--- Logs from the failed container ---'
                    sh script: """
                        docker logs --tail 100 '${env.CONTAINER_NAME}' 2>&1
                        docker inspect -f 'state={{.State.Status}} exit={{.State.ExitCode}}' '${env.CONTAINER_NAME}'
                        exit 0
                    """, returnStatus: true
                    rollback()
                } else {
                    echo 'Failed before deployment started - nothing to roll back.'
                }
            }
        }

        success {
            echo "Deployed ${env.IMAGE_NAME}:${env.IMAGE_TAG} (commit ${env.GIT_SHA}) on port ${env.HOST_PORT}."
        }
    }
}
