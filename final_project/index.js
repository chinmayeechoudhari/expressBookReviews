const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'bookshop_session_development_secret',
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use('/customer/auth', (req, res, next) => {
  const bearer = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearer || req.session?.authorization?.accessToken;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'bookshop_development_secret');
    return next();
  } catch (_) { return res.status(401).json({ message: 'Invalid or expired token' }); }
});
app.use('/customer', customer_routes);
app.use('/', genl_routes);
const PORT = process.env.PORT || 5000;
if (require.main === module) app.listen(PORT, () => console.log('Server is running on port ' + PORT));
module.exports = app;
