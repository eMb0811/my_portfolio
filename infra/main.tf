data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd*/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values  = ["hvm"]
  }
}

resource "aws_instance" "portfolio_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.portfolio_key.key_name
  vpc_security_group_ids = [aws_security_group.portfolio_sg.id]

  tags = {
    Name = "portfolio-server"
  }
}
