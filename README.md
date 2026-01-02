# HopShare API

Intuitive, easy-to-use application that facilitates carpooling in an organized manner.

- Primary contract: OpenAPI Spec (see swagger.json)
- Context: User Stories
- Business Rules: Requirements

This backend is production-ready with:
- ES Modules, async/await throughout
- Centralized error handling
- Basic Authentication (HTTP Basic) for mutating operations
- Validation using Joi based on the OpenAPI schemas
- Mongoose models, with automatic fallback to mock in-memory data when MongoDB is unavailable
- Standardized response shape: `{ success, data, error, message }`

## Quick Start

1) Install
```bash
npm install
```

2) Configure environment
```bash
cp .env.example .env
# Edit .env as needed. If you don't have MongoDB, leave MONGO_URI empty to use mock data.
```

3) Run
```bash
npm run start
# or in dev with auto-reload
npm run dev
```

Server starts at:
```
http://localhost:${PORT:-3000}
```

Health check:
```bash
curl http://localhost:3000/health
```

## Authentication

- Mutating endpoints (POST/PUT/DELETE) require HTTP Basic when `BASIC_AUTH_ENABLED=true` (default).
- Use one of the seeded credentials when in mock mode:
  - alice@example.com / password123 (admin account)
  - bob@example.com / password123
  - charlie@example.com / password123

Example with curl:
```bash
curl -u alice@example.com:password123 -X POST http://localhost:3000/routes \
  -H "Content-Type: application/json" \
  -d '{"Start":"City X","End":"City Y","Stops":"Midpoint","DateAndTime":1732000000,"OccupiedSeats":1}'
```

## Response Format

All endpoints return a consistent JSON shape:
```json
{ "success": true, "data": {...}, "error": null, "message": "OK" }
```
On error:
```json
{ "success": false, "data": null, "error": "VALIDATION_ERROR", "message": "Please ..." }
```

## Available Endpoints (excerpt)

- Routes:
  - GET /routes
  - POST /routes
  - GET /routes/:routeID
  - PUT /routes/:routeID
  - DELETE /routes/:routeID

- Requests:
  - GET /requests
  - POST /requests
  - GET /requests/:requestID
  - PUT /requests/:requestID
  - DELETE /requests/:requestID

- Reports:
  - GET /reports
  - POST /reports
  - GET /reports/:reportID

- Users:
  - GET /users
  - POST /users
  - GET /users/:userID
  - PUT /users/:userID
  - DELETE /users/:userID

- Cars (nested):
  - GET /users/:userID/cars
  - POST /users/:userID/cars
  - GET /users/:userID/cars/:carID
  - PUT /users/:userID/cars/:carID
  - DELETE /users/:userID/cars/:carID

- Conversations & Messages (nested):
  - GET /users/:userID/conversations
  - POST /users/:userID/conversations
  - GET /users/:userID/conversations/:conversationID
  - PUT /users/:userID/conversations/:conversationID
  - DELETE /users/:userID/conversations/:conversationID
  - GET /users/:userID/conversations/:conversationID/messages
  - POST /users/:userID/conversations/:conversationID/messages
  - GET /users/:userID/conversations/:conversationID/messages/:messageID
  - PUT /users/:userID/conversations/:conversationID/messages/:messageID
  - DELETE /users/:userID/conversations/:conversationID/messages/:messageID

- Reviews (nested):
  - GET /users/:userID/reviews?myReviews=true|false
  - POST /users/:userID/reviews
  - GET /users/:userID/reviews/:reviewID
  - PUT /users/:userID/reviews/:reviewID
  - DELETE /users/:userID/reviews/:reviewID

## Data Model

Mongoose models are provided for:
- Route, Request, Report
- User, Car
- Conversation, Message
- Review

If `MONGO_URI` is not set or connection fails, the API uses mock in-memory data seeded at startup that support the core flows from the user stories:
- Managing Routes, Cars, and Requests
- Reporting users
- Writing/Editing/Deleting Reviews
- Managing Conversations and Messages

## Error Handling

Errors are funneled to a centralized error handler which distinguishes between:
- AppError (custom errors with an explicit status/code)
- Joi validation errors
- Mongoose validation/cast errors
- Mongo server errors
- Fallback to 500 Internal Server Error

## Development Notes

- Code uses ES6 modules and async/await throughout.
- Every controller is wrapped in try/catch and defers to next(err).
- Validation aligns closely with the provided OpenAPI component schemas.
- Security hardening via Helmet and CORS.
- Logging via Morgan.

## Testing With Mock Data

With no `MONGO_URI`, try:

1) List routes
```bash
curl http://localhost:3000/routes
```

2) Create a route (auth required)
```bash
curl -u alice@example.com:password123 -X POST http://localhost:3000/routes \
  -H "Content-Type: application/json" \
  -d '{"Start":"City X","End":"City Y","Stops":"Midpoint","DateAndTime":1732000000,"OccupiedSeats":1}'
```

3) Update a route (auth required)
```bash
curl -u alice@example.com:password123 -X PUT http://localhost:3000/routes/1 \
  -H "Content-Type: application/json" \
  -d '{"Start":"City A","End":"City B","Stops":"Stop1, Stop2","DateAndTime":1731400000,"OccupiedSeats":2}'
```

4) Delete a route (auth required)
```bash
curl -u alice@example.com:password123 -X DELETE http://localhost:3000/routes/1
```

…and similarly for requests, cars, conversations/messages, reviews, and reports.

## Security

- Basic Auth is used for demonstration and aligns with requirement. For production, prefer token-based auth (JWT/OAuth2) over Basic.
- Passwords are hashed with bcrypt when creating/updating users. Seeded mock users are auto-hashed at runtime.

## License

MIT

