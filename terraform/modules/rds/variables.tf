variable "project_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "subnet_ids" {
  type        = list(string)
  description = "プライベートサブネット ID のリスト（2つ以上必要）"
}

variable "security_group_ids" {
  type = list(string)
}
