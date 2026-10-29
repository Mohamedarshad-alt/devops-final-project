variable "aws_region" {
  description = "AWS region for the project"
  type        = string
  default     = "ap-south-1"
}

variable "aws_profile" {
  description = "AWS CLI profile"
  type        = string
  default     = "terraform-lab"
}

variable "key_pair_name" {
  description = "Existing AWS EC2 key pair"
  type        = string
  default     = "terraform-ansible-lab-key"
}

variable "my_ip" {
  description = "Your public IPv4 address in CIDR notation, used for SSH"
  type        = string

  validation {
    condition     = can(cidrhost(var.my_ip, 0)) && endswith(var.my_ip, "/32")
    error_message = "my_ip must be a single IPv4 address in /32 CIDR notation, such as 203.0.113.10/32."
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "project_name" {
  description = "Name prefix for project resources"
  type        = string
  default     = "devops-final-project"
}
