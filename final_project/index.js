const express = require('express');
const session = require('express-session');
const books = require('./router/booksdb.js');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

app.use(express.json());
app.use('/customer', session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }));

// JSON data source consumed by general.js through Axios.
app.get('/data/books.json', (req, res) => res.status(200).json(books));

// Review routes require an active login session.
app.use('/customer/auth', (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Please log in first.' });
  }
  return next();
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
