const express = require('express');
const axios = require('axios');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// The JSON data source is exposed by index.js at /data/books.json.
// Axios + async/await are used to retrieve all books and filter them.
const DATA_URL = 'http://localhost:5000/data/books.json';

async function fetchBooks() {
  const response = await axios.get(DATA_URL);
  return response.data;
}

// Register a new user.
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: `User ${username} already exists.` });
  }

  users.push({ username, password });
  return res.status(201).json({ message: `User ${username} registered successfully.` });
});

// Get the book list available in the shop.
public_users.get('/', async (req, res) => {
  try {
    const books = await fetchBooks();
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Get book details based on ISBN.
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const books = await fetchBooks();
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found.` });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Get all books based on author.
public_users.get('/author/:author', async (req, res) => {
  try {
    const books = await fetchBooks();
    const author = req.params.author.toLowerCase();
    const matches = {};

    for (const [isbn, book] of Object.entries(books)) {
      if (book.author.toLowerCase() === author) {
        matches[isbn] = book;
      }
    }

    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: `No books by author ${req.params.author} found.` });
    }
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Get all books based on title.
public_users.get('/title/:title', async (req, res) => {
  try {
    const books = await fetchBooks();
    const title = req.params.title.toLowerCase();
    const matches = {};

    for (const [isbn, book] of Object.entries(books)) {
      if (book.title.toLowerCase() === title) {
        matches[isbn] = book;
      }
    }

    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: `No books with title ${req.params.title} found.` });
    }
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Get book review.
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const books = await fetchBooks();
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found.` });
    }
    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve reviews.' });
  }
});

module.exports.general = public_users;
