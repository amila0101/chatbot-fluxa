# API Documentation

Chatbot Fluxa provides a RESTful API that allows you to interact with the chatbot, check system health, and access administrative functions. The API is documented using the OpenAPI 3.0 specification, which provides a standardized way to describe RESTful APIs.

## Accessing the API Documentation

The API documentation is available at the following URL:

- **Development**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Production**: [https://chatbot-fluxa.com/api/docs](https://chatbot-fluxa.com/api/docs)

## Using the API Documentation

The API documentation is interactive and allows you to:

1. **Browse Endpoints**: View all available API endpoints, their parameters, and response formats.
2. **Try Endpoints**: Send requests to the API directly from the documentation interface.
3. **View Models**: See the data models used by the API.
4. **Authenticate**: Provide authentication tokens for secured endpoints.

## API Endpoints

The API provides the following main endpoints:

### Chat

- **POST /api/chat**: Send a message to the chatbot and receive a response.

### Health

- **GET /api/health**: Check the health status of the API.

### Admin

- **GET /api/admin**: Get authentication status for admin users.

## Authentication

Some endpoints require authentication using a Bearer token. To authenticate:

1. Obtain a JWT token (the method depends on your implementation).
2. Click the "Authorize" button in the API documentation.
3. Enter your token in the format: `Bearer your_token_here`.
4. Click "Authorize" to apply the token to all requests.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 5 requests per minute per IP address.
- When the rate limit is exceeded, the API returns a 429 status code with a `Retry-After` header.

## OpenAPI Specification

The raw OpenAPI specification is available in both YAML and JSON formats:

- **YAML**: [/api/docs/openapi.yaml](/api/docs/openapi.yaml)
- **JSON**: [/api/docs/openapi.json](/api/docs/openapi.json)

You can use these files with tools like Postman, Insomnia, or other API clients.

## Example Usage

### Sending a Chat Message

```javascript
// Example using fetch API
async function sendChatMessage(message) {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        model: 'gemini' // Optional
      }),
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
```

### Checking API Health

```javascript
// Example using fetch API
async function checkApiHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Error checking API health:', error);
    return false;
  }
}
```

### Accessing Admin Endpoint

```javascript
// Example using fetch API
async function getAdminStatus(token) {
  try {
    const response = await fetch('http://localhost:5000/api/admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting admin status:', error);
    throw error;
  }
}
```

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

## Integrating with Your Application

To integrate the Chatbot Fluxa API with your application:

1. **Choose a Client Library**: Use a library appropriate for your programming language (e.g., Axios for JavaScript, Requests for Python).
2. **Handle Authentication**: Implement the authentication flow if accessing secured endpoints.
3. **Implement Error Handling**: Handle API errors gracefully in your application.
4. **Respect Rate Limits**: Implement retry logic with exponential backoff for rate-limited requests.

## Further Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.0)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JWT Authentication](https://jwt.io/)
