var express = require('express');
var user = require('../controller/user-controller');
var router = express.Router();

router.get('/register', (req, res) => res.render('user/register'));
router.post('/register', user.register);
router.get('/login', (req, res) => res.render('user/login', { loginErr: req.session.loginErr = false }));
router.post('/login', user.login);
router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/user/login'); });
router.get('/home', (req, res) => res.render('user/home', { username: req.session.username }));

module.exports = router;