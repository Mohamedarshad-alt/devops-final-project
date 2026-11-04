output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IPv4 address of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "Example SSH command"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.app.public_ip}"
}

output "test_instance_id" {
  description = "Test EC2 instance ID"
  value       = aws_instance.test.id
}

output "test_public_ip" {
  description = "Public IPv4 address of the test EC2 instance"
  value       = aws_instance.test.public_ip
}
