# API Reference

This document provides detailed information about the Chatbot Fluxa API endpoints, request parameters, and response formats.

## Base URL

All API endpoints are relative to the base URL:

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-deployment-url.com/api`

## Authentication

Some endpoints require authentication using a Bearer token:

```
Authorization: Bearer <your_token>
```

## Error Handling

All endpoints follow a consistent error response format:

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

## Endpoints

### Chat

#### Send a Message

Sends a user message to the chatbot and receives a response.

**Endpoint:** `POST /chat`

**Authentication:** Not required

**Request Body:**

```json
{
  "message": "Hello, how can you help me today?",
  "model": "gemini"  // Optional, defaults to the server's configured model
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | The user's message to the chatbot |
| model | string | No | The AI model to use (e.g., "gemini", "openai") |

**Response:**

```json
{
  "response": "Hello! I'm Chatbot Fluxa, an AI assistant. I can help you with information, answer questions, assist with tasks, and more. What would you like to know or discuss today?",
  "timestamp": "2023-04-17T14:27:47.491Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| response | string | The chatbot's response to the user's message |
| timestamp | string | ISO 8601 timestamp of when the response was generated |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What can you do?"}'
```

**Error Responses:**

- `400 Bad Request`: If the message is missing or empty
- `429 Too Many Requests`: If rate limit is exceeded
- `500 Internal Server Error`: If there's an error processing the request

### Health

#### Check API Health

Checks the health status of the API and returns basic information.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**

```json
{
  "status": "ok",
  "model": "gemini"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| status | string | The current status of the API ("ok" if healthy) |
| model | string | The currently configured AI model |

**Example Request:**

```bash
curl http://localhost:5000/api/health
```

### Admin

#### Get Admin Status

Returns the authentication status for admin users.

**Endpoint:** `GET /admin`

**Authentication:** Required

**Response:**

```json
{
  "status": "authenticated",
  "message": "Admin access granted"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| status | string | Authentication status |
| message | string | Status message |

**Example Request:**

```bash
curl -X GET http://localhost:5000/api/admin \
  -H "Authorization: Bearer your_token_here"
```

**Error Responses:**

- `401 Unauthorized`: If authentication is missing or invalid

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 5 requests per minute per IP address
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum number of requests allowed per window
  - `X-RateLimit-Remaining`: Number of requests remaining in the current window
  - `X-RateLimit-Reset`: Time in seconds until the rate limit window resets

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests, please try again later",
  "retryAfter": 30
}
```

## Websocket API

In addition to the REST API, Chatbot Fluxa provides a WebSocket API for real-time communication.

**Connection URL:** `ws://localhost:5000/ws` (Development)

### Message Format

Messages sent and received through the WebSocket connection use the following format:

```json
{
  "type": "message",
  "content": "Hello, how can you help me?",
  "timestamp": "2023-04-17T14:27:47.491Z"
}
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| message | Client → Server | Send a message to the chatbot |
| response | Server → Client | Receive a response from the chatbot |
| typing | Server → Client | Indicates the chatbot is "typing" |
| error | Server → Client | Indicates an error occurred |

## API Versioning

The current API version is v1. The version is implicit in the current implementation.

Future versions will be explicitly versioned in the URL path:

```
/api/v2/chat
```

## SDK and Client Libraries

Official client libraries for Chatbot Fluxa API:

- **JavaScript/TypeScript**: `@chatbot-fluxa/js-client`
- **Python**: `chatbot-fluxa-python`

## Changelog

### v1.0.0 (Current)

- Initial API release
- Basic chat functionality
- Health check endpoint
- Admin authentication

## Additional Resources

- [OpenAPI Specification](../server/swagger.yaml)
- [Postman Collection](../resources/chatbot-fluxa.postman_collection.json)
- [API Usage Examples](../how-to/api-integration.md)
