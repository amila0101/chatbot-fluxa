terraform {
  required_providers {
    render = {
      source = "render-oss/render"
      version = "~> 1.0.0"
    }
    uptimerobot = {
      source = "louy/uptimerobot"
      version = "~> 0.5.1"
    }
  }
}

provider "render" {
  api_key = var.render_api_key
}

provider "uptimerobot" {
  api_key = var.uptimerobot_api_key
}

# Render Web Service
resource "render_service" "chatbot" {
  name        = "chatbot-app"
  type        = "web_service"
  env_type    = "node"
  repo_url    = var.github_repo_url
  branch      = "main"

  build_command = "npm install && npm run build"
  start_command = "npm start"

  environment_variables = {
    NODE_ENV = "production"
    MONGODB_URI = var.mongodb_uri
    AI_API_KEY = var.ai_api_key
    SENTRY_DSN = var.sentry_dsn
  }

  health_check_path = "/health"
}

# UptimeRobot Monitoring
resource "uptimerobot_monitor" "main" {
  friendly_name = "Chatbot App"
  type          = "http"
  url           = render_service.chatbot.service_url
  interval      = 300

  alert_contact {
    id = var.uptimerobot_alert_contact_id
  }
}

# Variables
variable "render_api_key" {
  description = "Render API Key"
  sensitive   = true
}

variable "uptimerobot_api_key" {
  description = "UptimeRobot API Key"
  sensitive   = true
}

variable "github_repo_url" {
  description = "GitHub Repository URL"
}

variable "mongodb_uri" {
  description = "MongoDB Connection URI"
  sensitive   = true
}

variable "ai_api_key" {
  description = "AI API Key"
  sensitive   = true
}

variable "sentry_dsn" {
  description = "Sentry DSN"
  sensitive   = true
}

variable "uptimerobot_alert_contact_id" {
  description = "UptimeRobot Alert Contact ID"
}