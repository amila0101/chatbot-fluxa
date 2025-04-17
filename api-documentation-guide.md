# API Documentation Guide

This guide explains how to use the Chatbot Fluxa API documentation, which is implemented using the OpenAPI 3.0 specification.

## Overview

The Chatbot Fluxa API is documented using the OpenAPI 3.0 specification, which provides a standardized way to describe RESTful APIs. The documentation is served through Swagger UI, which provides an interactive interface for exploring and testing the API.

## Accessing the API Documentation

The API documentation is available at the following URL:

- **Development**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Production**: [https://chatbot-fluxa.com/api/docs](https://chatbot-fluxa.com/api/docs)

## Using Swagger UI

Swagger UI provides an interactive interface for exploring and testing the API. Here's how to use it:

1. **Browse Endpoints**: The documentation is organized by tags (Chat, Health, Admin). Click on a tag to see all endpoints in that category.

2. **Expand Operations**: Click on an operation (e.g., "Send a message to the chatbot") to see details about the endpoint, including parameters, request body, and responses.

3. **Try It Out**: Click the "Try it out" button to test an endpoint directly from the documentation.

4. **Fill in Parameters**: Enter the required parameters and request body.

5. **Execute**: Click the "Execute" button to send the request to the API.

6. **View Results**: See the response from the API, including status code, headers, and body.

## Authentication

Some endpoints (like `/api/admin`) require authentication using a Bearer token. To authenticate in Swagger UI:

1. Click the "Authorize" button at the top of the page.
2. Enter your token in the format: `Bearer your_token_here`.
3. Click "Authorize" to apply the token to all requests.

## API Endpoints

The API provides the following main endpoints:

### Chat

- **POST /api/chat**: Send a message to the chatbot and receive a response.
  - Request body: `{ "message": "Your message here", "model": "gemini" }`
  - Response: `{ "response": "AI response here" }`

### Health

- **GET /api/health**: Check the health status of the API.
  - Response: `{ "status": "ok", "model": "gemini" }`

### Admin

- **GET /api/admin**: Get authentication status for admin users.
  - Headers: `Authorization: Bearer your_token_here`
  - Response: `{ "status": "authenticated", "message": "Admin access granted" }`

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 5 requests per minute per IP address.
- When the rate limit is exceeded, the API returns a 429 status code with a `Retry-After` header.

## Raw OpenAPI Specification

The raw OpenAPI specification is available in both YAML and JSON formats:

- **YAML**: [/api/docs/openapi.yaml](/api/docs/openapi.yaml)
- **JSON**: [/api/docs/openapi.json](/api/docs/openapi.json)

You can use these files with tools like Postman, Insomnia, or other API clients.

## Postman Collection

A Postman collection is available for testing the API. You can find it in the `server/postman` directory:

- `chatbot-fluxa-api.postman_collection.json`: The Postman collection
- `chatbot-fluxa-api.postman_environment.json`: Environment variables for development
- `chatbot-fluxa-api-production.postman_environment.json`: Environment variables for production

To use the Postman collection:

1. Import the collection and environment files into Postman.
2. Select the appropriate environment (Development or Production).
3. Update the `adminToken` variable with your actual token.
4. Start making requests to the API.

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Implementation Details

The API documentation is implemented using:

- **OpenAPI 3.0**: The specification format for describing the API
- **Swagger UI Express**: A middleware for serving Swagger UI
- **YAML.js**: A library for parsing YAML files

The implementation consists of:

1. **openapi.yaml**: The OpenAPI specification file
2. **routes/docs.js**: The route handler for serving the documentation
3. **server.js**: The server configuration that mounts the documentation route

## Updating the Documentation

When you make changes to the API, you should update the OpenAPI specification to reflect those changes:

1. Edit the `server/openapi.yaml` file to update endpoints, parameters, responses, etc.
2. Restart the server to see the changes in Swagger UI.

## Best Practices

- **Keep Documentation Updated**: Always update the OpenAPI specification when you change the API.
- **Include Examples**: Provide examples for request bodies and responses.
- **Document Error Responses**: Include all possible error responses for each endpoint.
- **Use Tags**: Organize endpoints using tags for better navigation.
- **Add Descriptions**: Include detailed descriptions for endpoints, parameters, and schemas.

## Troubleshooting

### Common Issues

- **Swagger UI Not Loading**: Make sure the server is running and the `/api/docs` route is properly configured.
- **Authentication Not Working**: Check that you're using the correct token format (`Bearer your_token_here`).
- **Rate Limiting Issues**: If you're hitting rate limits during testing, you can temporarily increase the limit in `middleware/rateLimiter.js`.

## Further Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.0)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
