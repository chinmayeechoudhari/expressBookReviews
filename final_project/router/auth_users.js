const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const users = [];

const isValid = (username) => users.some(u => u.username === username);
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET || 'bookshop_development_secret', { expiresIn: '1h' });
  req.session.authorization = { accessToken: token, username };
  return res.status(200).json({ message: 'User successfully logged in', token });
});

regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.query.review ?? req.body?.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review must be a nonempty string' });
  }
  book.reviews[req.user.username] = review;
  return res.status(200).json({ message: 'Review added/updated successfully', reviews: book.reviews });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) {
    return res.status(404).json({ message: 'Review not found for this user' });
  }
  delete book.reviews[req.user.username];
  return res.status(200).json({ message: 'Review deleted successfully', reviews: book.reviews });
});

module.exports = { authenticated: regd_users, authenticatedUser, isValid, users };
