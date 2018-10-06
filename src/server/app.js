const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const apiRouter = require('./routes/api');
const expressStaticGzip = require("express-static-gzip");

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// // app.use(express.static(path.join(__dirname, '../', 'dist')));
// app.use('/assets/TLV_TERRAIN', (req, res, next) => {
//   res.set('Content-Encoding', 'gzip');
//   res.set('Content-Type', 'application/octet-stream');
//   next()
// }, express.static(path.join(__dirname, 'assets/TLV_TERRAIN')));

app.use('/assets/tiles', express.static(path.join(__dirname, 'assets/tiles'),{
  setHeaders: (res, path) => {
    if (path.endsWith('.terrain')) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// app.use('/assets/TLV_TERRAIN',  expressStaticGzip('assets/TLV_TERRAIN', {
//   customCompressions: [{
//       encodingName: "gzip",
//       fileExtension: "terrain"
//   }]
// }));
app.use('/api', apiRouter);

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../', 'dist/index.html'));
// });

module.exports = app;
