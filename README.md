# Security Dashboard

A comprehensive security dashboard application for monitoring and managing account access and security settings.

## Features

- **Security Dashboard**: View security score, active sessions, weak passwords, and pending recommendations
- **Security Status**: Check overall security status and implement recommendations
- **Activity Log**: Monitor all account activity with details on location, device, and time
- **Password Manager**: Store and manage passwords with strength indicators
- **Sessions Manager**: View and terminate active sessions across devices
- **Account Settings**: Update profile information and security settings

## Getting Started

### Using the Simple Server (Recommended)

1. Run the simple server that combines API and static file serving:
   ```
   node simple-server.cjs
   ```

2. Access the Security Dashboard at: http://0.0.0.0:8000/

### API Endpoints

The following API endpoints are available:

- `GET /api/user` - Get user information
- `GET /api/dashboard/summary` - Get security dashboard summary
- `GET /api/security-events` - Get security events history
- `GET /api/security-alerts` - Get active security alerts
- `GET /api/sessions` - Get active sessions
- `GET /api/passwords` - Get stored passwords
- `GET /api/recommendations` - Get security recommendations

## Testing API Endpoints

You can test API endpoints directly from the Security Dashboard using the API Test section.

## Server Scripts

- `simple-server.cjs` - Combined API and static file server
- `start-simple-server.cjs` - Script to start the simple server in foreground mode

## Notes

- The Security Dashboard uses an in-memory database for demonstration purposes
- All data is reset when the server restarts
- The current implementation focuses on the UI and data visualization components