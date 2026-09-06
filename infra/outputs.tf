output "public_ip" {
  description = "IP public de EC2"
  value       = aws_instance.portfolio_server.public_ip
}

output "ssh_command" {
  description = "Commande pour se connecter en SSH"
  value       = "ssh -i ~/.ssh/portfolio-ec2 ubuntu@${aws_instance.portfolio_server.public_ip}"
}
