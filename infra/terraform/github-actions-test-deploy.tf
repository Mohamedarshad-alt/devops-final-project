
# Additional GitHub Actions permission for TEST EC2 deployment.
# The existing production deployment policy remains unchanged.

resource "aws_iam_policy" "github_actions_test_deploy" {
  name        = "GitHubActionsTestEC2DeployPolicy"
  description = "Allow GitHub Actions to send deployment commands to the test EC2 only"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "SendCommandsToTestEC2Only"
        Effect = "Allow"

        Action = [
          "ssm:SendCommand"
        ]

        Resource = [
          "arn:aws:ssm:ap-south-1::document/AWS-RunShellScript",
          "arn:aws:ec2:ap-south-1:788516091241:instance/i-0c4f68769d3bd1b69"
        ]
      }
    ]
  })

  tags = {
    Project     = "devops-final-project"
    Environment = "test"
    ManagedBy   = "Terraform"
  }
}

# Attach the new test-only policy to the existing GitHub Actions role.
# This does not recreate or modify the role itself.

resource "aws_iam_role_policy_attachment" "github_actions_test_deploy" {
  role       = "GitHubActionsDevOpsDeployRole"
  policy_arn = aws_iam_policy.github_actions_test_deploy.arn
}
