# Project Evidence Checklist

## 1. Purpose

This folder contains screenshots, command outputs and workflow evidence demonstrating the implementation and testing of the DevOps project.

Before submission, remove passwords, tokens, private keys, account-sensitive information and other secrets from all evidence.

## 2. Application Evidence

- [ ] API `/health` endpoint returning HTTP 200.
- [ ] API `/api/v1/items` endpoint response.
- [ ] API `/metrics` endpoint response.
- [ ] Automated application test results.

## 3. Infrastructure Evidence

- [ ] Terraform validation output.
- [ ] Terraform plan or resource output.
- [ ] AWS EC2 instance details.
- [ ] Security group inbound rules.
- [ ] Successful Ansible ping.
- [ ] Successful Ansible playbook execution.
- [ ] Docker and Docker Compose versions.

## 4. CI/CD Evidence

- [ ] Successful GitHub Actions CI workflow.
- [ ] Successful security workflow.
- [ ] Successful Docker image publishing workflow.
- [ ] GHCR published image and tags.
- [ ] Successful AWS OIDC authentication and deployment.
- [ ] Successful post-deployment health check.
- [ ] Production environment protection settings.

## 5. Security Evidence

- [ ] Gitleaks scan result.
- [ ] Semgrep scan result.
- [ ] npm audit result.
- [ ] Trivy image scan result.
- [ ] Docker container security configuration.
- [ ] Security group showing restricted SSH and private service ports.
- [ ] S3 public access block and encryption settings.

## 6. Monitoring and Logging Evidence

- [ ] Prometheus targets showing API and Node Exporter as UP.
- [ ] Prometheus application metrics.
- [ ] Grafana monitoring dashboard.
- [ ] Grafana service-down alert rule.
- [ ] API stop and recovery test.
- [ ] CloudWatch CPU alarm.
- [ ] CloudWatch alarm notification received.
- [ ] Docker and Nginx logs.

## 7. Backup and Recovery Evidence

- [ ] Successful database backup execution.
- [ ] S3 backup object listing.
- [ ] Database dump inspection.
- [ ] Isolated database restoration.
- [ ] Restored database tables and record count.
- [ ] Previous application image deployment.
- [ ] Original application version restored.
- [ ] Final application health check.

## 8. Pending Evidence

- [ ] HTTPS certificate and HTTP-to-HTTPS verification.
- [ ] Successful Grafana SMTP notification.
- [ ] Secure remote Terraform state configuration.
- [ ] Automated rollback workflow, if implemented.
- [ ] Production reviewer approval enforcement, if configured.

Do not mark pending evidence as completed until the corresponding feature is implemented and tested.

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
