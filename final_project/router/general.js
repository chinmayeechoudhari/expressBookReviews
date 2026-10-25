const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) return res.status(409).json({ message: 'User already exists' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. Now you can login' });
});

public_users.get('/', (req, res) => res.status(200).json(books));

public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({ message: 'Book not found' });
});

public_users.get('/author/:author', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, b]) =>
    b.author.toLowerCase().includes(req.params.author.toLowerCase())));
  return res.status(200).json(matches);
});

public_users.get('/title/:title', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, b]) =>
    b.title.toLowerCase().includes(req.params.title.toLowerCase())));
  return res.status(200).json(matches);
});

public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

// Async/Await with Axios: Tasks 12-14 (and all books).
// These are exported for programmatic use without altering the public API.
const API = process.env.BOOK_API_URL || 'http://127.0.0.1:5000';
async function getAllBooks() { return (await axios.get(API + '/')).data; }
async function getBookByISBN(isbn) {
  return (await axios.get(API + '/isbn/' + encodeURIComponent(isbn))).data;
}
async function getBooksByAuthor(author) {
  return (await axios.get(API + '/author/' + encodeURIComponent(author))).data;
}
async function getBooksByTitle(title) {
  return (await axios.get(API + '/title/' + encodeURIComponent(title))).data;
}

module.exports = { general: public_users, getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle };
