variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト名（リソース命名に使用）"
  type        = string
  default     = "taskmanagement"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "learning"
}

variable "ec2_key_pair_name" {
  description = "EC2 SSH 接続に使うキーペア名（aws ec2 import-key-pair で登録済みのもの）"
  type        = string
}

variable "my_ip_cidr" {
  description = "SSH・HTTP を許可する自分の IP（例: 1.2.3.4/32）。curl ifconfig.me で確認できる"
  type        = string
}
