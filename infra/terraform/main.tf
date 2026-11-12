
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

data "aws_subnet" "selected" {
  id = sort(data.aws_subnets.default.ids)[0]
}

# Pin the AMI currently used by both existing EC2 instances.
# Update this deliberately when planning an Ubuntu upgrade.
locals {
  ubuntu_ami_id = "ami-0fc5120b2d80d4749"
}

# Application EC2 security group.
resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg"
  description = "Restricted SSH and public web traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH from the configured administrator IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound traffic for updates and application access"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = var.project_name
  }
}

# Main application EC2 instance.
resource "aws_instance" "app" {
  ami                         = local.ubuntu_ami_id
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnet.selected.id
  vpc_security_group_ids      = [aws_security_group.app.id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 12
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name    = "${var.project_name}-ec2"
    Project = var.project_name
  }
}

# Look up the existing IAM instance profile.
# This profile already has SSM and CloudWatch permissions.
data "aws_iam_instance_profile" "devops_ssm" {
  name = "DevOpsFinalProjectSSMRole"
}

# Separate security group for the test EC2 instance.
# No inbound rules yet; SSM is used for administration.
resource "aws_security_group" "test" {
  name        = "${var.project_name}-test-sg"
  description = "Outbound access only for test EC2 through SSM"
  vpc_id      = data.aws_vpc.default.id

  egress {
    description = "Outbound traffic for SSM and system updates"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-test-sg"
    Project     = var.project_name
    Environment = "test"
  }
}

# Separate test EC2 instance.
resource "aws_instance" "test" {
  ami                         = local.ubuntu_ami_id
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnet.selected.id
  vpc_security_group_ids      = [aws_security_group.test.id]
  iam_instance_profile        = data.aws_iam_instance_profile.devops_ssm.name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 12
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name        = "${var.project_name}-test-ec2"
    Project     = var.project_name
    Environment = "test"
  }
}
