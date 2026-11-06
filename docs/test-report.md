# DevOps Project – Test and Validation Report

## 1. Project Information

**Project:** End-to-End DevOps Automation on AWS

**Environment:** AWS EC2, Ubuntu 24.04, ap-south-1

**Application:** Node.js REST API with PostgreSQL

## 2. Application Tests

| Test | Expected Result | Status |
|---|---|---|
| API health endpoint | HTTP 200 | PASS |
| Database connectivity | Database connected | PASS |
| Application metrics endpoint | HTTP 200 | PASS |
| Automated application tests | Tests pass in CI | PASS |

## 3. Infrastructure Tests

| Test | Expected Result | Status |
|---|---|---|
| Terraform configuration validation | No configuration errors | PASS |
| Terraform plan review | Plan generated and reviewed; no resources applied | PASS |
| Security group configuration | Required ports configured | PASS |
| Ansible connectivity | Successful ping | PASS |
| Ansible Docker installation playbook | No failed or unreachable tasks | PASS |
| Isolated test EC2 application deployment | Ansible deployment playbook completed; 8 tasks passed | PASS |
| Test EC2 API container | Running with expected GHCR image | PASS |
| Test EC2 PostgreSQL container | Running and healthy | PASS |
| Test EC2 API health and database connectivity | healthy; database connected | PASS |
| Test EC2 items endpoint | HTTP 200; two valid records returned | PASS |
| Docker service | Active | PASS |
| Docker Compose | Available | PASS |

## 4. CI/CD Tests

| Test | Expected Result | Status |
|---|---|---|
| GitHub Actions CI workflow | Successful execution | PASS |
| Security workflow | Successful execution | PASS |
| Docker image build | Image builds successfully | PASS |
| GHCR publishing | Image published | PASS |
| AWS OIDC authentication | Successful authentication | PASS |
| SSM deployment | Deployment completed | PASS |
| Post-deployment health check | API healthy | PASS |

## 5. Security Tests

| Test | Expected Result | Status |
|---|---|---|
| Gitleaks | Workflow passes | PASS |
| Semgrep | Workflow passes | PASS |
| npm audit | Workflow passes | PASS |
| Trivy image scan | Scan job completed successfully; detailed findings require review | PASS (execution) |
| Docker container hardening | Security options configured | PASS |
| Database public access | Not publicly exposed | PASS |
| Terraform state Git exclusion | State files ignored and untracked | PASS |
| Production environment protection | Reviewer configured; self-review prevention disabled; deployment branch policy not configured | PARTIAL |
| HTTPS certificate and redirection | Not implemented | PENDING |
| Remote Terraform state | S3 backend verified; encryption and versioning enabled | PASS |

## 6. Monitoring and Logging Tests

| Test | Expected Result | Status |
|---|---|---|
| Prometheus API target | Target UP | PASS |
| Prometheus Node Exporter target | Target UP | PASS |
| API metrics | Available | PASS |
| Host CPU metrics | Available | PASS |
| Host memory metrics | Available | PASS |
| Host filesystem metrics | Available | PASS |
| Grafana dashboard | Dashboard configured | PASS |
| API service-down alert rule | Configured | PASS |
| API stop and recovery test | API healthy after restart | PASS |
| CloudWatch CPU alarm | Configured and email received | PASS |
| Grafana SMTP email delivery | Not configured; email delivery remains pending | PENDING |

## 7. Backup and Recovery Tests

| Test | Expected Result | Status |
|---|---|---|
| PostgreSQL backup creation | Dump created | PASS |
| S3 backup upload | Object uploaded and verified | PASS |
| S3 versioning | Enabled | PASS |
| S3 encryption | Enabled | PASS |
| Database dump inspection | Dump readable by pg_restore | PASS |
| Isolated database restoration | Tables and records restored | PASS |
| Isolated application configuration rollback | Original configuration restored and API recovered | PASS |
| Manual application image-digest rollback on isolated test EC2 | Previous immutable image restored; API and database health verified | PASS |
| Automatic GitHub Actions image rollback after deployment failure | Failure-triggered recovery path not exercised | NOT TESTED |
| Final API health verification | Healthy with database connected | PASS |

## 8. Known Limitations

1. The project currently runs on one EC2 instance.
2. HTTPS certificate installation and HTTP-to-HTTPS redirection are pending.
3. Grafana SMTP email delivery is not configured.
4. Terraform uses an S3 remote backend with encryption, versioning and native lock-file configuration.
5. Manual Docker image-digest rollback was successfully tested on the isolated test EC2. Automatic GitHub Actions image rollback after a failed deployment has not been deliberately tested.
6. A required production reviewer is configured. Self-review prevention is disabled, and no deployment branch policy is configured.
7. High availability and cross-region disaster recovery are not implemented.

## 9. Overall Result

The main application deployment, infrastructure automation, CI/CD workflows,
security scanning, database backup, isolated database restoration and
application health validation have been implemented and tested.

A manual Docker image-digest rollback was successfully completed on the
isolated test EC2. The previous image was restored and API health and
database connectivity were verified. A separate configuration rollback
simulation was also completed. Automatic GitHub Actions image rollback
triggered by a failed deployment remains untested.

The project has also verified the isolated Ansible application deployment,
including API health, PostgreSQL connectivity and application data retrieval.

HTTPS, Grafana SMTP delivery, strict independent production approval,
high availability and cross-region disaster recovery remain limitations
or pending items. Additional Prometheus and Grafana implementation work
is excluded from the remaining project scope.

This report distinguishes implemented features, completed tests and
remaining verification. It reflects the evidence captured and reviewed
during project implementation.
