var express = require('express');
var instn = require('../controller/instn-controller');
var router = express.Router();

router.get('/register', (req, res) => res.render('instn/register'));
router.post('/register', instn.register);
router.get('/login', (req, res) => res.render('instn/login', { loginErr: req.session.loginErr = false }));
router.post('/login', instn.login);
router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/instn/login'); });
// router.get('/home', (req, res) => res.render('instn/home', { username: req.session.username }));

module.exports = router;