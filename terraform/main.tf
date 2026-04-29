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

module "ec2" {
  source             = "./modules/ec2"
  project_name       = var.project_name
  subnet_id          = module.vpc.public_subnet_id
  security_group_ids = [module.security_groups.ec2_sg_id]
  key_pair_name      = var.ec2_key_pair_name
  aws_region         = var.aws_region
}
