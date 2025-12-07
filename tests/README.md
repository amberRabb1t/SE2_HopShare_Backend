# Backend Tests (AVA + c8 + got)

- Test runner: AVA
- Coverage: c8 (V8 native)
- HTTP client: got
- Server: node:http (ephemeral port per test run)
- Authentication: Basic Auth using mock user `alice@example.com / password123`

How to run:
```bash
# from backend project root
npm install
npm test
npm run coverage  # prints summary from the last run