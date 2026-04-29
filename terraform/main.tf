provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
}

module "security_groups" {
  source       = "./modules/security_groups"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  my_ip_cidr   = var.my_ip_cidr
}

module "secrets" {
  source       = "./modules/secrets"
  project_name = var.project_name
  db_username  = var.db_username
  db_password  = var.db_password
  jwt_secret   = var.jwt_secret
}

module "rds" {
  source             = "./modules/rds"
  project_name       = var.project_name
  db_username        = var.db_username
  db_password        = var.db_password
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.security_groups.rds_sg_id]
}

module "ec2" {
  source             = "./modules/ec2"
  project_name       = var.project_name
  subnet_id          = module.vpc.public_subnet_ids[0]
  security_group_ids = [module.security_groups.ec2_sg_id]
  key_pair_name      = var.ec2_key_pair_name
  aws_region         = var.aws_region
}

module "alb" {
  source             = "./modules/alb"
  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [module.security_groups.alb_sg_id]
  ec2_instance_id    = module.ec2.instance_id
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = var.project_name
}
