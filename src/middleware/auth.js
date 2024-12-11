import { authorizedUsers } from '../auth/users.js';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const isAuthorized = Object.values(authorizedUsers).some(
    user => `Bearer ${user.token}` === token
  );

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Invalid or unauthorized token' });
  }

  next();
}; 