variable "project_name" {
  type = string
}

variable "vpc_id" {
  type        = string
  description = "セキュリティグループを作成する VPC の ID"
}

variable "my_ip_cidr" {
  type        = string
  description = "SSH・HTTP を許可する自分の IP（例: 1.2.3.4/32）"
}
