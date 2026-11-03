
terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket       = "devops-final-project-terraform-state-788516091241"
    key          = "envs/devops-final-project/terraform.tfstate"
    region       = "ap-south-1"
    profile      = "terraform-lab"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
