# Infrastructure Provisioning and Configuration

## 1. Objective

This document explains how AWS infrastructure is provisioned using Terraform and how the EC2 server is configured using Ansible.

It also documents the secure Terraform remote state backend hosted in AWS S3.

## 2. Tools Used

- Terraform: Infrastructure as Code.
- AWS EC2: Virtual machine hosting the application.
- AWS S3: Secure remote Terraform state storage.
- AWS Security Groups: Network access control.
- Ansible: Server configuration automation.
- Docker: Container runtime.

## 3. Terraform Configuration

Terraform configuration is maintained in:

`infra/terraform/`

Important files:

| File | Purpose |
|---|---|
| `main.tf` | Data sources, security group and EC2 resources |
| `variables.tf` | Input variable definitions |
| `terraform.tfvars` | Local variable values; excluded from Git |
| `outputs.tf` | Infrastructure outputs |
| `versions.tf` | Terraform version, AWS provider and S3 backend configuration |
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

## 4. Secure Terraform Remote State

### Objective

Terraform state records the resources managed by Terraform. It can contain sensitive information, so it must be protected.

This project uses an AWS S3 remote backend instead of relying on local state storage.

### S3 backend configuration

- S3 bucket: `devops-final-project-terraform-state-788516091241`
- AWS region: `ap-south-1`
- State key: `envs/devops-final-project/terraform.tfstate`
- AWS CLI profile: `terraform-lab`
- Encryption: AES256 server-side encryption
- Versioning: Enabled
- Public access: Blocked
- Transport security: HTTPS enforced
- State locking: Enabled using Terraform's native S3 lock file (`use_lockfile = true`).

The backend is configured in `infra/terraform/versions.tf`.

### Backend initialization and migration

The existing local Terraform state was backed up securely before migration.

The state was migrated to S3 using:

```bash
terraform init -migrate-state
```

Terraform prompted for confirmation to copy the existing state to the new backend. The migration was confirmed successfully.

### Verification

The following checks were completed:

1. Terraform successfully initialized the S3 backend.
2. `terraform state list` displayed the existing AWS resources.
3. AWS S3 `head-object` confirmed that the remote state object exists.
4. The returned S3 version ID confirmed versioned storage.
5. `terraform plan -lock=true -refresh=false` completed successfully and reported no infrastructure changes.

### Remote state security practices

- Never commit Terraform state files to Git.
- Never share raw Terraform state contents.
- Keep `terraform.tfvars` and local state backups outside Git.
- Restrict access to the S3 bucket using AWS IAM permissions.
- Keep S3 public access blocked.
- Use encrypted storage and HTTPS-only access.
- Retain S3 object versions for recovery.
- Use state locking to prevent conflicting Terraform operations.

## 5. Ansible Configuration

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

## 6. Verification

The infrastructure and server configuration were verified with:

- Docker installed and running.
- Docker Compose installed.
- Ansible connectivity successful.
- Ansible playbook completed without failed or unreachable tasks.
- Application containers running.
- Terraform remote state successfully migrated to S3.
- Existing Terraform resources visible in the remote state.
- Terraform plan completed without infrastructure changes.

## 7. Security Considerations

- SSH access should be restricted to an authorized IP.
- Private SSH keys must not be committed.
- Terraform variable files and state files must not be committed.
- Use least-privilege AWS IAM permissions.
- Protect Terraform state because it may contain sensitive values.
- Enable S3 versioning and server-side encryption.
- Block all public access to the Terraform state bucket.
- Enforce HTTPS-only access to the S3 bucket.
- Use Terraform state locking to prevent concurrent state modifications.

## 8. Current Limitations

- The deployment currently uses a single EC2 instance, creating a single point of failure.
- The EC2 public IP may change after certain instance lifecycle operations. The Ansible inventory must be updated if the IP changes.
- High availability and cross-region disaster recovery are future improvements.
- S3 bucket access still depends on correctly configured AWS IAM permissions and account security.
