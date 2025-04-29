// Simple express server to serve both the API and static files
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;

// In-memory data storage
const USERS = {
  1: {
    id: 1,
    username: 'demo_user',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    createdAt: new Date('2023-01-15')
  }
};

const SECURITY_EVENTS = [
  {
    id: 1,
    userId: 1,
    eventType: 'login',
    description: 'Successful login',
    ipAddress: '192.168.1.1',
    deviceInfo: 'Chrome on macOS',
    location: 'San Francisco, CA',
    timestamp: new Date('2025-04-29T10:15:00')
  },
  {
    id: 2,
    userId: 1,
    eventType: 'password_change',
    description: 'Password changed',
    ipAddress: '192.168.1.1',
    deviceInfo: 'Chrome on macOS',
    location: 'San Francisco, CA',
    timestamp: new Date('2025-04-28T14:22:00')
  },
  {
    id: 3,
    userId: 1,
    eventType: 'failed_login',
    description: 'Failed login attempt',
    ipAddress: '45.123.45.67',
    deviceInfo: 'Unknown',
    location: 'Moscow, Russia',
    timestamp: new Date('2025-04-27T03:45:00')
  },
  {
    id: 4,
    userId: 1,
    eventType: 'login',
    description: 'Successful login',
    ipAddress: '192.168.1.5',
    deviceInfo: 'Firefox on Windows',
    location: 'San Francisco, CA',
    timestamp: new Date('2025-04-26T18:30:00')
  },
  {
    id: 5,
    userId: 1,
    eventType: 'login',
    description: 'Successful login',
    ipAddress: '172.16.254.1',
    deviceInfo: 'Safari on iOS',
    location: 'New York, NY',
    timestamp: new Date('2025-04-24T09:12:00')
  },
  {
    id: 6,
    userId: 1,
    eventType: 'email_change',
    description: 'Email updated',
    ipAddress: '192.168.1.1',
    deviceInfo: 'Chrome on macOS',
    location: 'San Francisco, CA',
    timestamp: new Date('2025-04-22T11:05:00')
  }
];

const SECURITY_ALERTS = [
  {
    id: 1,
    userId: 1,
    alertType: 'suspicious_login',
    description: 'Unusual login detected from Moscow, Russia',
    severity: 'high',
    timestamp: new Date('2025-04-27T03:45:00'),
    dismissed: false
  }
];

const SESSIONS = [
  {
    id: 1,
    userId: 1,
    deviceInfo: 'Chrome on macOS',
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
    lastActive: new Date('2025-04-29T10:15:00'),
    isCurrentSession: true
  },
  {
    id: 2,
    userId: 1,
    deviceInfo: 'Safari on iOS',
    ipAddress: '172.16.254.1',
    location: 'New York, NY',
    lastActive: new Date('2025-04-27T09:12:00'),
    isCurrentSession: false
  },
  {
    id: 3,
    userId: 1,
    deviceInfo: 'Firefox on Windows',
    ipAddress: '192.168.1.5',
    location: 'San Francisco, CA',
    lastActive: new Date('2025-04-24T18:30:00'),
    isCurrentSession: false
  }
];

const STORED_PASSWORDS = [
  {
    id: 1,
    userId: 1,
    serviceName: 'Gmail',
    username: 'username@gmail.com',
    password: '************',
    strength: 'weak',
    lastUpdated: new Date('2025-02-29')
  },
  {
    id: 2,
    userId: 1,
    serviceName: 'Facebook',
    username: 'username@gmail.com',
    password: '**************',
    strength: 'weak',
    lastUpdated: new Date('2024-04-29')
  },
  {
    id: 3,
    userId: 1,
    serviceName: 'Amazon',
    username: 'username@gmail.com',
    password: '****************',
    strength: 'medium',
    lastUpdated: new Date('2025-04-15')
  },
  {
    id: 4,
    userId: 1,
    serviceName: 'Bank Account',
    username: 'username',
    password: '********************',
    strength: 'strong',
    lastUpdated: new Date('2025-04-22')
  }
];

const RECOMMENDATIONS = [
  {
    id: 1,
    userId: 1,
    type: 'enable_2fa',
    title: 'Enable Two-Factor Authentication',
    description: 'Add an extra layer of security by requiring a second verification step when logging in.',
    implemented: false,
    priority: 'high'
  },
  {
    id: 2,
    userId: 1,
    type: 'update_weak_passwords',
    title: 'Update Weak Passwords',
    description: 'You have 2 passwords that are considered weak or have been reused across multiple sites.',
    implemented: false,
    priority: 'high'
  },
  {
    id: 3,
    userId: 1,
    type: 'review_activity',
    title: 'Review Recent Activity',
    description: 'You\'ve recently checked your account activity. Keep monitoring for any suspicious logins.',
    implemented: true,
    priority: 'medium'
  },
  {
    id: 4,
    userId: 1,
    type: 'remove_unused_apps',
    title: 'Remove Unused Applications',
    description: 'You have 3 applications that haven\'t been used in over 6 months but still have access to your account.',
    implemented: false,
    priority: 'medium'
  }
];

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
app.get('/api/user', (req, res) => {
  res.json(USERS[1]);
});

app.get('/api/dashboard/summary', (req, res) => {
  const securityScore = 75;
  const activeSessions = SESSIONS.length;
  const weakPasswords = STORED_PASSWORDS.filter(pw => pw.strength === 'weak').length;
  const recommendations = RECOMMENDATIONS.filter(rec => !rec.implemented).length;
  const alerts = SECURITY_ALERTS.filter(alert => !alert.dismissed).length;

  res.json({
    securityScore,
    activeSessions,
    weakPasswords,
    recommendations,
    alerts
  });
});

app.get('/api/security-events', (req, res) => {
  res.json(SECURITY_EVENTS);
});

app.get('/api/security-alerts', (req, res) => {
  res.json(SECURITY_ALERTS);
});

app.post('/api/security-alerts/:id/dismiss', (req, res) => {
  const id = parseInt(req.params.id);
  const alert = SECURITY_ALERTS.find(a => a.id === id);
  
  if (alert) {
    alert.dismissed = true;
    res.json({ success: true, alert });
  } else {
    res.status(404).json({ success: false, message: 'Alert not found' });
  }
});

app.get('/api/sessions', (req, res) => {
  res.json(SESSIONS);
});

app.post('/api/sessions/:id/terminate', (req, res) => {
  const id = parseInt(req.params.id);
  const sessionIndex = SESSIONS.findIndex(s => s.id === id);
  
  if (sessionIndex !== -1 && !SESSIONS[sessionIndex].isCurrentSession) {
    SESSIONS.splice(sessionIndex, 1);
    res.json({ success: true });
  } else if (SESSIONS[sessionIndex]?.isCurrentSession) {
    res.status(400).json({ success: false, message: 'Cannot terminate current session' });
  } else {
    res.status(404).json({ success: false, message: 'Session not found' });
  }
});

app.post('/api/sessions/terminate-all', (req, res) => {
  const currentSession = SESSIONS.find(s => s.isCurrentSession);
  const terminated = SESSIONS.filter(s => !s.isCurrentSession).length;
  
  // Remove all sessions except the current one
  const newSessions = [currentSession].filter(Boolean);
  SESSIONS.length = 0;
  SESSIONS.push(...newSessions);
  
  res.json({ success: true, terminated });
});

app.get('/api/passwords', (req, res) => {
  res.json(STORED_PASSWORDS);
});

app.post('/api/passwords', (req, res) => {
  const { serviceName, username, password, strength } = req.body;
  
  if (!serviceName || !username || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const newId = Math.max(...STORED_PASSWORDS.map(p => p.id)) + 1;
  
  const newPassword = {
    id: newId,
    userId: 1,
    serviceName,
    username,
    password: '*'.repeat(password.length),
    strength: strength || 'medium',
    lastUpdated: new Date()
  };
  
  STORED_PASSWORDS.push(newPassword);
  res.status(201).json({ success: true, password: newPassword });
});

app.put('/api/passwords/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { serviceName, username, password, strength } = req.body;
  
  const passwordIndex = STORED_PASSWORDS.findIndex(p => p.id === id);
  
  if (passwordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Password not found' });
  }
  
  if (serviceName) STORED_PASSWORDS[passwordIndex].serviceName = serviceName;
  if (username) STORED_PASSWORDS[passwordIndex].username = username;
  if (password) STORED_PASSWORDS[passwordIndex].password = '*'.repeat(password.length);
  if (strength) STORED_PASSWORDS[passwordIndex].strength = strength;
  
  STORED_PASSWORDS[passwordIndex].lastUpdated = new Date();
  
  res.json({ success: true, password: STORED_PASSWORDS[passwordIndex] });
});

app.delete('/api/passwords/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const passwordIndex = STORED_PASSWORDS.findIndex(p => p.id === id);
  
  if (passwordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Password not found' });
  }
  
  STORED_PASSWORDS.splice(passwordIndex, 1);
  res.json({ success: true });
});

app.get('/api/recommendations', (req, res) => {
  res.json(RECOMMENDATIONS);
});

app.put('/api/recommendations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { implemented } = req.body;
  
  const recommendationIndex = RECOMMENDATIONS.findIndex(r => r.id === id);
  
  if (recommendationIndex === -1) {
    return res.status(404).json({ success: false, message: 'Recommendation not found' });
  }
  
  if (implemented !== undefined) {
    RECOMMENDATIONS[recommendationIndex].implemented = implemented;
  }
  
  res.json({ success: true, recommendation: RECOMMENDATIONS[recommendationIndex] });
});

// Serve the security-dashboard.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'security-dashboard.html'));
});

// Serve the security-dashboard.html file explicitly
app.get('/security-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'security-dashboard.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Security Dashboard running at http://0.0.0.0:${port}/`);
  console.log('API endpoints:');
  console.log('- GET /api/user');
  console.log('- GET /api/dashboard/summary');
  console.log('- GET /api/security-events');
  console.log('- GET /api/security-alerts');
  console.log('- GET /api/sessions');
  console.log('- GET /api/passwords');
  console.log('- GET /api/recommendations');
});