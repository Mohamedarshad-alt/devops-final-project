
# End-to-End DevOps Automation on AWS

## 1. Project Overview

This project implements an end-to-end DevOps workflow for deploying and operating a Node.js REST API on AWS.

It uses Infrastructure as Code, configuration management, containerization, CI/CD automation, security scanning, monitoring, logging, database backups, and application recovery procedures.

## 2. Project Objectives

- Automate AWS infrastructure provisioning using Terraform.
- Configure EC2 servers using Ansible.
- Containerize the application using Docker.
- Automate testing, security scanning and deployment using GitHub Actions.
- Publish Docker images to GitHub Container Registry.
- Configure Nginx as a reverse proxy.
- Monitor application and server performance.
- Implement database backups and recovery procedures.
- Test application version rollback.

## 3. Technology Stack

| Category | Technology |
|---|---|
| Application | Node.js, Express |
| Database | PostgreSQL |
| Infrastructure | AWS EC2, Terraform |
| Configuration Management | Ansible |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry |
| Reverse Proxy | Nginx (HTTPS configuration pending) |
| Monitoring | Prometheus, Grafana, Node Exporter |
| Cloud Monitoring | Amazon CloudWatch |
| Backup Storage | Amazon S3 |
| Operating System | Ubuntu 24.04 LTS |

## 4. Application Features

The project includes a Node.js REST API with PostgreSQL integration.

### API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Checks application and database health |
| `GET /api/v1/items` | Retrieves application items |
| `GET /metrics` | Exposes application metrics for Prometheus |

Automated application tests are implemented using Node.js testing tools and Supertest.

## 5. Infrastructure and Deployment

The infrastructure is provisioned on AWS in the `ap-south-1` region.

Implemented components:

- AWS EC2 Ubuntu instance.
- AWS Security Group.
- Restricted SSH access.
- HTTP and HTTPS security group rules.
- Encrypted 12 GB gp3 root EBS volume.
- IMDSv2 instance metadata protection.
- Terraform infrastructure configuration.
- Ansible server configuration.
- Docker and Docker Compose installation.
- Nginx reverse proxy.

The application and supporting services are deployed using Docker Compose.

## 6. CI/CD and Security

GitHub Actions automates application validation, security scanning, image publishing and deployment.

### Implemented workflows

- `ci.yml` – application testing and validation.
- `security.yml` – dependency, source-code, container and secret scanning.
- `publish.yml` – validation, Docker image publishing and deployment.

### Security tools

- npm audit – dependency vulnerability scanning.
- Semgrep – source-code security scanning.
- Gitleaks – secret detection.
- Trivy – Docker image vulnerability scanning.

### Deployment process

1. Developer pushes code to GitHub.
2. GitHub Actions runs application tests.
3. Security scanning is performed.
4. Docker image is built and scanned.
5. Image is published to GitHub Container Registry.
6. GitHub Actions authenticates to AWS using OIDC.
7. AWS Systems Manager executes deployment commands on EC2.
8. Docker Compose updates the API container.
9. Application health is verified.

Manual application version rollback has been tested. Automated rollback in the GitHub Actions workflow remains pending.

## 7. Monitoring and Logging

The project uses Prometheus, Grafana, Node Exporter and CloudWatch.

### Prometheus

Collects:

- Application metrics.
- API request metrics.
- Node.js process metrics.
- EC2 host metrics through Node Exporter.

### Grafana

Provides a monitoring dashboard containing:

- CPU utilization.
- Memory utilization.
- Disk utilization.
- API availability.

A service-down alert rule has been configured and tested.

Grafana SMTP email delivery remains pending.

### CloudWatch

- EC2 CPU utilization monitoring.
- High CPU alarm configuration.
- CloudWatch Agent installation.
- CPU alarm email notification successfully received.

### Logging

- Docker container logs.
- Nginx access and error logs.
- Host health-check logs.
- Docker log rotation.
- Host log rotation using logrotate.

## 8. Database Backup and Recovery

PostgreSQL database backups are created using an automated backup script.

Implemented features:

- PostgreSQL custom-format database dumps.
- Backup validation.
- Scheduled daily backup.
- Amazon S3 backup storage.
- S3 versioning.
- S3 server-side encryption.
- S3 public access blocking.

### Recovery testing

The following operations were successfully tested:

- Database backup uploaded to S3.
- Backup file inspected using `pg_restore`.
- Backup restored into a separate test database.
- Restored tables and records verified.
- Previous application image deployed.
- Original application version restored.
- API health verified after recovery.

## 9. Current Project Limitations

The following requirements remain incomplete or require further verification:

1. HTTPS certificate installation and HTTP-to-HTTPS redirection.
2. Grafana SMTP email notification delivery.
3. Secure remote Terraform state backend.
4. Automated application rollback in GitHub Actions.
5. Mandatory production reviewer enforcement.
6. Final evidence collection and submission review.
7. Verification of the dedicated non-root deployment user requirement.

The deployment currently uses one EC2 instance. This creates a single point of failure. High availability and cross-region disaster recovery are not implemented.

## 10. Repository Structure

```text
devops-final-project/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── publish.yml
├── .semgrep/
│   └── rules.yml
├── app/
│   ├── db/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── package-lock.json
├── docker/
│   └── Dockerfile
├── docs/
│   ├── architecture/
│   │   └── architecture.md
│   ├── evidence/
│   │   └── README.md
│   ├── runbooks/
│   │   └── troubleshooting.md
│   ├── backup-and-recovery.md
│   ├── cicd-and-security.md
│   ├── infrastructure-deployment.md
│   ├── monitoring-and-logging.md
│   └── test-report.md
├── infra/
│   ├── ansible/
│   └── terraform/
├── monitoring/
│   ├── prometheus/
│   └── grafana/
├── nginx/
│   └── devops-app.conf
├── scripts/
│   ├── cron/
│   ├── logrotate/
│   ├── systemd/
│   ├── backup-devops-db.sh
│   └── devops-health-check.sh
├── .dockerignore
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 11. Security Guidelines

- Never commit passwords, tokens, private keys or production environment files.
- Restrict SSH access to authorized IP addresses.
- Do not expose database or internal monitoring ports publicly.
- Use least-privilege AWS IAM permissions.
- Protect Terraform state files.
- Scan application dependencies and Docker images.
- Use secure secret management practices.
- Redact sensitive information from screenshots and logs.

## 12. Project Deliverables

- Application source code and automated tests.
- Terraform infrastructure configuration.
- Ansible configuration playbook.
- Docker and Docker Compose configuration.
- Nginx reverse proxy configuration.
- GitHub Actions CI/CD and security workflows.
- Prometheus and Grafana monitoring configuration.
- AWS architecture diagram.
- Test and security evidence.
- Deployment and troubleshooting documentation.
- Database backup and restoration evidence.
- Application rollback and recovery evidence.

## 13. GitHub Repository

Repository: https://github.com/Mohamedarshad-alt/devops-final-project

## 14. Project Summary

This project demonstrates an automated DevOps deployment workflow on AWS using Terraform, Ansible, Docker, GitHub Actions and monitoring tools.

The application deployment, CI/CD pipeline, security scanning, monitoring setup, database backup, isolated database restoration and manual application rollback have been implemented and tested.

Remaining limitations are documented separately and will be addressed before final submission where feasible.
