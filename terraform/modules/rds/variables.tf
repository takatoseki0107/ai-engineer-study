variable "project_name" {
  type = string
}

variable "subnet_ids" {
  type        = list(string)
  description = "RDS を配置するプライベートサブネット ID 一覧（2AZ 以上必要）"
}

variable "security_group_ids" {
  type        = list(string)
  description = "RDS に適用するセキュリティグループ ID 一覧"
}

variable "db_name" {
  type        = string
  description = "作成するデータベース名"
  default     = "taskmanagement"
}

variable "db_username" {
  type        = string
  description = "マスターユーザー名"
  default     = "postgres"
}

variable "db_password" {
  type        = string
  description = "マスターパスワード（機密情報のため terraform.tfvars で指定する）"
  sensitive   = true
}

variable "db_instance_class" {
  type        = string
  description = "RDS インスタンスクラス"
  default     = "db.t3.micro"
}
