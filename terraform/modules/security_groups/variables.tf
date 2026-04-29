variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "my_ip_cidr" {
  type        = string
  description = "SSH を許可する IP（例: 1.2.3.4/32）"
}
