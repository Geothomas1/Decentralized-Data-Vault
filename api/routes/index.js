var express = require('express');
var router = express.Router();
var user = require('../controller/user-controller');
router.get('/', (req, res) => res.render('index'));
router.get('/register', (req, res) => {
    res.render('user/register')
});
router.get('/login', (req, res) => {
    res.render('user/login', { loginErr: req.session.loginErr = false })
});
router.post('/register', user.register);
router.post('/login', user.login);
router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})
module.exports = router;