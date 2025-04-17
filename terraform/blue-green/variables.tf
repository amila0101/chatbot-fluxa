variable "vercel_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "chatbot-fluxa"
}

variable "github_repo" {
  description = "GitHub repository in format username/repo"
  type        = string
}

variable "mongodb_uri" {
  description = "MongoDB connection string"
  type        = string
  sensitive   = true
}

variable "ai_api_key" {
  description = "AI API key"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "blue_branch" {
  description = "Git branch for blue environment"
  type        = string
  default     = "main"
}

variable "green_branch" {
  description = "Git branch for green environment"
  type        = string
  default     = "staging"
}

variable "production_domain" {
  description = "Production domain name"
  type        = string
  default     = "chatbot-fluxa.com"
}
