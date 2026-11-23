const express = require('express');
const books = require('./booksdb.js');
const regd_users = express.Router();

// In-memory user store (users are registered through POST /register).
let users = [];

// Returns true when the username is not already taken.
const isValid = (username) => !users.some((user) => user.username === username);

// Returns true when the username/password pair matches a registered user.
const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

// Only registered users can log in. A session is created on success.
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  req.session.user = username;
  return res.status(200).json({ message: `User ${username} has logged in.` });
});

// Add or update a review for a book (requires an active login session).
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const review = req.body.review || req.query.review;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
  if (!review) {
    return res.status(400).json({ message: 'Review text is required.' });
  }

  books[isbn].reviews[req.session.user] = review;
  return res.status(200).json({
    message: `Review for ISBN ${isbn} added/updated by ${req.session.user}.`,
    reviews: books[isbn].reviews
  });
});

// Delete the logged-in user's review for a book.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  delete books[isbn].reviews[req.session.user];
  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted by ${req.session.user}.`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
