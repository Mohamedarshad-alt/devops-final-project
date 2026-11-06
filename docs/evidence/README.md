# Project Evidence Checklist

## 1. Purpose

This folder contains screenshots, command outputs and workflow evidence demonstrating the implementation and testing of the DevOps project.

Before submission, remove passwords, tokens, private keys, account-sensitive information and other secrets from all evidence.

## 2. Application Evidence

- [x] API `/health` endpoint returning HTTP 200.
- [x] API `/api/v1/items` endpoint response.
- [x] API `/metrics` endpoint response.
- [x] Automated application test results.

## 3. Infrastructure Evidence

- [x] Terraform validation output.
- [x] Terraform plan or resource output.
- [x] AWS EC2 instance details.
- [x] Security group inbound rules.
- [x] Successful Ansible ping through AWS SSM to isolated test EC2.
- [x] Successful Ansible Docker installation playbook execution.
- [x] Successful isolated application deployment using `deploy-test-application.yml`.
- [x] Test EC2 Docker Compose containers showing API running and PostgreSQL healthy.
- [x] Test EC2 `/health` response showing healthy status and connected database.
- [x] Test EC2 `/api/v1/items` response showing two valid records.
- [x] Docker and Docker Compose versions.
- [x] S3 remote Terraform state object verification.
- [x] S3 state encryption and versioning verification.

## 4. CI/CD Evidence

- [x] Successful GitHub Actions CI workflow.
- [x] Successful security workflow.
- [x] Successful Docker image publishing workflow.
- [x] GHCR published image and tags.
- [x] Successful AWS OIDC authentication and deployment.
- [x] Successful post-deployment health check.
- [ ] Production environment protection settings.
- [x] Automatic rollback implementation in `publish.yml` reviewed.
- [x] Manual image-digest rollback test on isolated test EC2 documented in `manual-image-rollback-test.md`.
- [x] Configuration rollback simulation documented in `configuration-rollback-test.md`.
- [ ] Automatic GitHub Actions image rollback after deployment failure tested.

## 5. Security Evidence

- [x] Gitleaks scan result.
- [x] Semgrep scan result.
- [x] npm audit result.
- [x] Trivy image scan result.
- [x] Docker container security configuration.
- [x] Security group showing restricted SSH and private service ports.
- [x] S3 public access block and encryption settings.

## 6. Monitoring and Logging Evidence

- [x] Prometheus targets showing API and Node Exporter as UP.
- [x] Prometheus application metrics.
- [x] Grafana monitoring dashboard.
- [x] Grafana service-down alert rule.
- [x] API stop and recovery test.
- [x] CloudWatch CPU alarm.
- [x] CloudWatch alarm notification received.
- [x] Docker application and database logs.
- [x] Docker log rotation configuration.
- [x] Application health-check log.
- [x] CloudWatch Agent service status and log configuration.

## 7. Backup and Recovery Evidence

- [x] Successful database backup execution.
- [x] S3 backup object listing.
- [x] S3 backup encryption and versioning.
- [x] Database dump inspection using `pg_restore --list`.
- [x] Isolated database restoration.
- [x] Restored database tables and record count.
- [x] Restored sample records verified.
- [x] Previous application image identified before successful new deployment.
- [x] Original application image restored on isolated test EC2 using the previous immutable digest.
- [x] Isolated configuration rollback simulation output.
- [x] Final application and database health checks after manual image rollback.

## 8. Implemented Features and Remaining Verification

| Item | Current status |
|---|---|
| S3 remote Terraform state | Implemented and verified |
| State encryption and versioning | Verified |
| Terraform native S3 lock-file configuration | Configured; concurrent locking test not performed |
| GitHub Actions automatic previous-image-digest rollback | Implemented and reviewed |
| Isolated rollback simulation | Completed |
| Automatic GitHub Actions image rollback after deployment failure | Not tested |
| Production required reviewer | Configured |
| Prevent self-review | Disabled |
| Administrator bypass | Allowed |
| Production deployment branch restriction | Not verified |
| HTTPS certificate and HTTP-to-HTTPS redirection | Excluded from current scope |
| Grafana SMTP notification | Not configured |
| High availability and cross-region disaster recovery | Not implemented |

The remaining project scope excludes Prometheus and Grafana implementation work.
Existing monitoring evidence may be retained as historical project evidence,
but no additional Prometheus/Grafana work is required for this scope.

Do not mark evidence as captured until the corresponding screenshot or output
has actually been saved and reviewed.

## 9. Suggested File Organization

```text
docs/evidence/
├── README.md
├── application/
├── infrastructure/
├── cicd/
├── security/
├── monitoring/
└── recovery/
```

Use descriptive filenames and record the date of each test.

## 10. Submission Rule

Only include evidence that was actually captured and verified. Redact sensitive information before adding screenshots or logs to the repository.
