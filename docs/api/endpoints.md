# API Documentation

## Base URL
```
http://localhost:4000
```

## Response Format
All API responses are in JSON format.

## Endpoints

### Health Check

#### Request
```
GET /api/hello
```

#### Response
```json
{
  "message": "Hello from Deno backend!"
}
```

### Get Messages

#### Request
```
GET /api/messages
```

#### Response
**Success (200 OK)**
```json
[
  {
    "id": 1,
    "text": "Sample message 1"
  },
  {
    "id": 2,
    "text": "Sample message 2"
  }
]
```

**Error (503 Service Unavailable)**
```json
{
  "error": "Database not connected"
}
```

**Error (500 Internal Server Error)**
```json
{
  "error": "Internal server error"
}
```

## Error Handling

### Status Codes
- `200` OK - Request successful
- `500` Internal Server Error - Unexpected error occurred
- `503` Service Unavailable - Database connection failed

### Error Response Format
```json
{
  "error": "Error message"
}
```

## CORS Headers
All responses include the following CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Development Notes
- The API is currently in early development
- No authentication is implemented
- Database schema is simple with just a `messages` table
- All endpoints are subject to change
