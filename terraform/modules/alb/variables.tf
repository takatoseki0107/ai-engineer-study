variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type        = list(string)
  description = "ALB を配置するパブリックサブネット ID（2つ以上必要）"
}

variable "security_group_ids" {
  type = list(string)
}

variable "ec2_instance_id" {
  type = string
}
