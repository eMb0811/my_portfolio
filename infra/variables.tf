
variable "aws_region" {
  description = "Region AWS ou deployer l'infra"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Type d'instance EC2"
  type        = string
  default     = "t2.micro"
}


variable "my_ip" {
  description = "Mon IP"
  type        = string
}
