var express = require('express');
var instn = require('../controller/instn-controller');
var router = express.Router();

router.get('/register', (req, res) => res.render('instn/register'));
router.post('/register', instn.register);

router.get('/login', (req, res) => res.render('instn/login', { loginErr: req.session.loginErr = false, success: 0 }));
router.post('/login', instn.login);

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/instn/login');
});

router.get('/home', (req, res) => res.render('instn/home', { username: req.session.user.username }));

router.get('/addData', (req, res) => res.render('instn/addData', { username: req.session.user.username }));
router.post('/addData', instn.checkInstn, instn.addData);
router.get('/permission', (req, res) => {
    res.render('instn/requestPermission', { username: req.session.user.username, request: 0 })
})
router.post('/requestPermission', instn.requestPermission)
router.get('/requestPermission', (req, res) => {
    res.render('instn/requestPermission', { username: req.session.user.username })
})
module.exports = router;