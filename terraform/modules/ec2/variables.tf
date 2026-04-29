variable "project_name" {
  type = string
}

variable "subnet_id" {
  type        = string
  description = "EC2 を配置するパブリックサブネット ID"
}

variable "security_group_ids" {
  type = list(string)
}

variable "key_pair_name" {
  type        = string
  description = "EC2 SSH 接続に使うキーペア名"
}

variable "aws_region" {
  type = string
}
