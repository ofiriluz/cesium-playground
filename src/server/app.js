const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, '../', 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/api', apiRouter);

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../', 'dist/index.html'));
// });

module.exports = app;
