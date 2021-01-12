var express = require('express');
var router = express.Router();
var user = require('../controller/user-controller');
var instn = require('../controller/instn-controller');

router.get('/', (req, res) => res.render('index'));

module.exports = router;