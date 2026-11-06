# CI/CD and Security Documentation

## 1. Objective

This document describes the project's automated testing, security scanning, Docker image publishing, AWS deployment and application rollback process.

The implementation uses:

- GitHub Actions
- GitHub Container Registry (GHCR)
- AWS IAM OpenID Connect (OIDC)
- AWS Systems Manager (SSM)
- Docker and Docker Compose
- Gitleaks, Semgrep, npm audit and Trivy

## 2. Workflow Files

Location: `.github/workflows/`

| Workflow | Responsibility |
|---|---|
| `ci.yml` | Application dependency installation, automated tests and syntax validation |
| `security.yml` | Dependency, source-code, container and secret scanning |
| `publish.yml` | Validation, Docker image publishing and production deployment |

These workflows are separate. Some validation and security checks are repeated in `publish.yml` to ensure that the image is validated before publishing.

## 3. Continuous Integration

The CI workflow runs on:

- Pushes to the `main` branch.
- Pull requests targeting `main`.

It performs:

1. Checks out the repository.
2. Sets up the required Node.js version.
3. Installs application dependencies.
4. Runs automated application tests.
5. Performs the configured validation checks.

The purpose of CI is to identify application errors before changes are merged or deployed.

## 4. Security Scanning

The security workflow runs automated security checks.

| Tool | Purpose |
|---|---|
| Gitleaks | Detects accidentally committed secrets and credentials |
| Semgrep | Performs static application code analysis |
| npm audit | Checks Node.js dependencies for known vulnerabilities |
| Trivy | Scans Docker images for known vulnerabilities |

### Security workflow process

1. GitHub Actions checks out the repository.
2. Gitleaks scans for exposed secrets.
3. Semgrep analyses application source code.
4. npm audit checks application dependencies.
5. Docker image scanning is performed using Trivy.
6. GitHub Actions reports the job results.

The security workflow completed successfully.

**Important:** Successful workflow execution confirms that the scanning jobs ran successfully. Detailed vulnerability findings still require review before claiming that the application has no vulnerabilities.

## 5. Docker Image Publishing and AWS Deployment

The publishing workflow is responsible for validating, building, publishing and deploying the application.

### 5.1 Docker image build

The workflow:

1. Checks out the repository.
2. Sets up Docker Buildx.
3. Builds the application Docker image.
4. Uses a commit-specific image tag.
5. Publishes the image to GitHub Container Registry.

Registry:

`ghcr.io/mohamedarshad-alt/devops-final-project`

Commit-specific image tags help identify the exact application version associated with a deployment.

### 5.2 AWS authentication using OIDC

GitHub Actions uses AWS IAM OIDC authentication.

Instead of storing long-lived AWS access keys in GitHub repository secrets, GitHub Actions requests temporary AWS credentials through the configured IAM role.

The process is:

1. GitHub Actions requests an OIDC token.
2. AWS validates the token against the configured trust policy.
3. AWS provides temporary credentials if the token and role conditions are valid.
4. GitHub Actions uses the temporary credentials to execute permitted AWS operations.

### 5.3 AWS Systems Manager deployment

The workflow uses AWS Systems Manager (SSM) to execute deployment commands on the EC2 instance.

The deployment process includes:

1. Connecting to the EC2 instance through SSM.
2. Pulling the required Docker image.
3. Updating the API service using Docker Compose.
4. Checking the application health endpoint.
5. Reporting the deployment result to GitHub Actions.

The application health endpoint verifies API health and database connectivity.

### 5.4 Deployment verification

After deployment, the API health endpoint is checked.

Expected response:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

A successful response indicates that the API is running and can connect to PostgreSQL.

The deployment health check does not independently validate the `/api/v1/items` endpoint.

## 6. Production Environment Protection

GitHub Environment protection settings were reviewed.

Current settings observed:

- Required reviewer: `Mohamedarshad-alt`.
- Prevent self-review: Not enabled.
- Administrator bypass: Allowed.
- Deployment branch restriction: Not verified.

A required reviewer is configured, but independent approval is not strictly enforced while self-review is permitted. Administrators can also bypass configured protection rules.

These limitations should be reviewed before treating production approval as mandatory independent approval.

## 7. Deployment Verification

Successful workflow executions were previously observed for:

- CI - Test API.
- Security Scan.
- Validate and Publish Docker Image.

AWS OIDC authentication and SSM production deployment were also tested.

The application health endpoint was checked after deployment.

Only retain PASS status for executions supported by actual GitHub Actions or application evidence.

## 8. Application Rollback

### 8.1 Automated rollback implementation

The publishing workflow contains automatic rollback logic.

Before deployment, it:

1. Identifies the running API container.
2. Identifies the previous GHCR image digest.
3. Aborts safely if the previous image digest cannot be identified.
4. Pulls the new commit-specific image.
5. Updates the API service.

If the new deployment command fails or the new application's health check fails within the configured health-check period, the workflow attempts to restore the previous image digest.

The rollback process:

1. Recreates the API service using the previous image digest.
2. Checks the API health endpoint.
3. Reports whether the previous application version recovered.
4. Returns a failed deployment status to GitHub Actions, even when rollback succeeds, so the failed release is not reported as successful.

If rollback also fails, the workflow prints API container logs for troubleshooting.

If pulling the new image fails, the workflow aborts before replacing the running application.

### 8.2 Rollback testing and evidence

A separate configuration rollback simulation was completed on an isolated AWS test EC2.

The test temporarily changed the API host port mapping from `3000` to `39001`, verified that the original port became unavailable, restored the original Compose configuration and verified API health again.

The isolated configuration rollback simulation passed.

A separate manual image-digest rollback test also passed on the isolated test EC2. The previous immutable image was restored, and API and database health were verified.

Production was not modified during these tests.

Neither test exercises the GitHub Actions automatic failure-triggered image rollback path.

The GitHub Actions automatic rollback implementation has been reviewed, but its failure-and-recovery path has not been deliberately tested in an actual deployment failure scenario.

## 9. Security Considerations

- Do not commit production environment files, passwords or private keys.
- Use GitHub OIDC instead of storing long-lived AWS access keys.
- Restrict IAM permissions to the required deployment actions.
- Scan application dependencies and Docker images before publishing.
- Keep application and database services restricted to required network access.
- Protect Terraform state and database backups.
- Rotate credentials if they are exposed.
- Review production environment approval and bypass settings.
- Redact secrets from screenshots, logs and project evidence.

## 10. Current Limitations

1. Automatic GitHub Actions failure-triggered image rollback has not been deliberately tested in an actual deployment failure scenario.
2. Manual image-digest rollback was tested on the isolated test EC2.
3. Production self-review prevention is not enabled.
4. Administrator bypass of environment protection is allowed.
5. Production deployment branch restrictions have not been verified.
6. The deployment health check verifies API and database connectivity, but does not independently test the `/api/v1/items` endpoint.
7. The application and database currently use a single EC2 instance.
8. HTTPS certificate installation and HTTP-to-HTTPS redirection are excluded from the current implementation scope.
9. High availability and cross-region disaster recovery are not implemented.
10. Detailed security scan findings still require review.

## 11. Conclusion

The project implements an automated CI/CD process using GitHub Actions, Docker, GHCR, AWS IAM OIDC and AWS Systems Manager.

Application testing, security scanning, Docker image publishing and AWS deployment have been demonstrated.

The publishing workflow includes automatic rollback logic, while manual image-digest rollback and configuration rollback have been successfully tested on an isolated test EC2.

The remaining limitations and untested scenarios are documented separately to maintain an accurate record of the project's implementation and verification status.
