'use strict';

const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');

const host = "localhost";
const port = "3000";

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))

logger.level = 'debug';

http.createServer(app).listen(port, () => {
    logger.info(`Server running at http://${host}:${port}`);
});

const indexRouter = require('./routes/index');
app.use('/', indexRouter);