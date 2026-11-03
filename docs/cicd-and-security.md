# CI/CD and Security Implementation

## 1. Objective

This document describes the automated testing, security scanning, Docker image publishing and EC2 deployment process implemented using GitHub Actions.

## 2. Workflow Files

Location: `.github/workflows/`

| Workflow | Responsibility |
|---|---|
| `ci.yml` | Application validation and automated tests |
| `security.yml` | Security and secret scanning |
| `publish.yml` | Validation, Docker image publishing and deployment |

## 3. Continuous Integration

The CI workflow runs on pushes and pull requests targeting the main branch.

It performs:

1. Checks out the repository.
2. Sets up Node.js 22.
3. Installs dependencies using `npm ci`.
4. Runs application tests using `npm test`.
5. Checks JavaScript syntax.

## 4. Security Scanning

The security workflow performs:

- `npm audit` for dependency vulnerabilities.
- Semgrep for source-code security analysis.
- Gitleaks for secret detection.
- Trivy for Docker image vulnerability scanning.

Security scans help identify potential issues before deployment. A successful scan does not guarantee that the application is completely secure.

## 5. Docker Image Publishing

The publish workflow:

1. Validates the application.
2. Runs tests and security checks.
3. Builds the Docker image.
4. Scans the image using Trivy.
5. Authenticates to GitHub Container Registry.
6. Publishes the image to GHCR.

The project image repository is:

`ghcr.io/mohamedarshad-alt/devops-final-project`

The workflow publishes image tags such as branch, Git tag and short commit SHA tags.

## 6. AWS Deployment

The deployment job uses:

- GitHub Actions.
- GitHub OIDC authentication.
- AWS IAM role.
- AWS Systems Manager.

Deployment process:

1. GitHub Actions authenticates using OIDC.
2. AWS grants the configured deployment role.
3. Systems Manager sends deployment commands to EC2.
4. Docker Compose pulls the new API image.
5. The API container is updated.
6. The workflow checks the application health endpoint.

The health endpoint is:

`http://127.0.0.1:3000/health`

## 7. Production Environment

The GitHub Actions deployment job is associated with the GitHub `production` environment.

Required reviewer enforcement must be verified in the repository's environment protection settings. Creating an environment alone does not guarantee manual approval.

## 8. Deployment Verification

Successful workflow executions were observed for:

- CI - Test API.
- Security Scan.
- Validate and Publish Docker Image.

The production deployment was also tested after correcting the AWS OIDC trust policy.

## 9. Rollback

A manual application version rollback was tested by deploying a previous image tag and then restoring the current image tag.

Both versions were checked using the API health endpoint.

Automated rollback on deployment failure has not yet been implemented in the GitHub Actions workflow.

## 10. Security Considerations

- No production environment file should be committed.
- GitHub Actions uses AWS OIDC instead of storing long-lived AWS access keys.
- IAM permissions should be restricted to required deployment actions.
- GHCR images should be scanned before publishing.
- Secrets should be rotated if exposed.
- Production approval settings should be verified.

## 11. Current Limitations

- Automated rollback is pending.
- Mandatory production reviewer enforcement needs verification.
- Deployments currently use the mutable `main` image tag.
- Image digest-based deployment verification is not yet implemented.
