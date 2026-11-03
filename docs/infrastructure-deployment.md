# Infrastructure Provisioning and Configuration

## 1. Objective

This document explains how AWS infrastructure is provisioned using Terraform and how the EC2 server is configured using Ansible.

## 2. Tools Used

- Terraform: Infrastructure as Code.
- AWS EC2: Virtual machine hosting the application.
- AWS Security Groups: Network access control.
- Ansible: Server configuration automation.
- Docker: Container runtime.

## 3. Terraform Configuration

Terraform configuration is maintained in:

`infra/terraform/`

Important files:

| File | Purpose |
|---|---|
| `main.tf` | AWS provider, data sources, security group and EC2 resources |
| `variables.tf` | Input variable definitions |
| `terraform.tfvars` | Local variable values; excluded from Git |
| `outputs.tf` | Infrastructure outputs |
| `versions.tf` | Terraform and provider version requirements |
| `.terraform.lock.hcl` | Provider dependency lock file |

### Infrastructure configuration

The Terraform configuration provisions:

- One Ubuntu 24.04 EC2 instance.
- A security group.
- Restricted SSH access.
- HTTP and HTTPS inbound rules.
- An encrypted 12 GB gp3 root EBS volume.
- IMDSv2 metadata protection.
- Public IP assignment.

The deployment region is `ap-south-1`.

### Terraform commands

Run these commands from the Terraform directory:

```bash
cd ~/devops-final-project/infra/terraform

terraform init
terraform fmt -check
terraform validate
terraform plan
```

Review the plan before applying changes.

Only apply infrastructure changes when explicitly intended:

```bash
terraform apply
```

View outputs:

```bash
terraform output
```

Do not run `terraform destroy` against the active project infrastructure without an approved cleanup plan.

## 4. Ansible Configuration

Ansible configuration is maintained in:

`infra/ansible/`

| File | Purpose |
|---|---|
| `inventory.ini` | EC2 connection details |
| `install-docker.yml` | Docker and Docker Compose installation |

### Ansible operations

Check connectivity:

```bash
ansible -i infra/ansible/inventory.ini webservers -m ping
```

Run the configuration playbook:

```bash
ansible-playbook -i infra/ansible/inventory.ini infra/ansible/install-docker.yml
```

The playbook performs:

1. APT package cache update.
2. Installation of Docker and required packages.
3. Docker service enablement and startup.
4. Addition of the Ubuntu user to the Docker group.
5. Docker version verification.
6. Docker Compose version verification.

## 5. Verification

The EC2 server was verified with:

- Docker installed and running.
- Docker Compose installed.
- Ansible connectivity successful.
- Ansible playbook completed without failed or unreachable tasks.
- Application containers running.

## 6. Security Considerations

- SSH access should be restricted to an authorized IP.
- Private SSH keys must not be committed.
- Terraform variable files and state files must not be committed.
- Use least-privilege AWS IAM permissions.
- Protect Terraform state because it may contain sensitive values.

## 7. Current Limitation

Terraform state is currently stored locally. A secure remote state backend with access control and state locking has not yet been configured.

The current configuration uses an automatically assigned EC2 public IP, which may change after certain instance lifecycle operations. The Ansible inventory must be updated if the IP changes.
