provider "vercel" {
  api_token = var.vercel_token
}

# Define the Vercel project
resource "vercel_project" "chatbot_project" {
  name      = var.project_name
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = var.github_repo
  }
  environment = [
    {
      key    = "MONGODB_URI"
      value  = var.mongodb_uri
      target = ["production", "preview"]
    },
    {
      key    = "AI_API_KEY"
      value  = var.ai_api_key
      target = ["production", "preview"]
    },
    {
      key    = "REACT_APP_GEMINI_API_KEY"
      value  = var.gemini_api_key
      target = ["production", "preview"]
    },
    {
      key    = "ENVIRONMENT_NAME"
      value  = "blue"
      target = ["production"]
    }
  ]
}

# Blue environment deployment
resource "vercel_deployment" "blue" {
  project_id = vercel_project.chatbot_project.id
  production = true
  ref        = var.blue_branch
  environment = {
    ENVIRONMENT_NAME = "blue"
  }
}

# Green environment deployment
resource "vercel_deployment" "green" {
  project_id = vercel_project.chatbot_project.id
  production = false
  ref        = var.green_branch
  environment = {
    ENVIRONMENT_NAME = "green"
  }
}

# Domain configuration
resource "vercel_project_domain" "production" {
  project_id = vercel_project.chatbot_project.id
  domain     = var.production_domain
}

# Blue domain configuration
resource "vercel_project_domain" "blue" {
  project_id = vercel_project.chatbot_project.id
  domain     = "blue.${var.production_domain}"
}

# Green domain configuration
resource "vercel_project_domain" "green" {
  project_id = vercel_project.chatbot_project.id
  domain     = "green.${var.production_domain}"
}
