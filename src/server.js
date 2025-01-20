const express = require('express');
const dotenv = require('dotenv');
const mongodbConnection = require('./config/mongodb.config');
const routes = require('./routes');
const cors = require('cors');

dotenv.config();

console.log('Server.js');

const app = express();

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options('*', cors());

// Connect to the database
mongodbConnection();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
