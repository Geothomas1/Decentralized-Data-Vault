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
const session = require('express-session');
const mongoose = require('mongoose');

const host = "localhost";
const port = "3000";

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'decentralized data vault',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))


logger.level = 'debug';

//const db = 'mongodb://manuel:manuel@127.0.0.1/ddvault?authSource=admin';
const db = 'mongodb://myUserAdmin:pwd@127.0.0.1/ddvault?authSource=admin';
mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    logger.info('MongoDB database connection established successfully!');
});

http.createServer(app).listen(port, () => {
    logger.info(`Server running at http://${host}:${port}`);
});

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
app.use('/', indexRouter);
app.use('/user', userRouter);