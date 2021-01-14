var express = require('express');
var admin = require('../controller/admin-controller');
var router = express.Router();

router.get('/login', (req, res) => {
    res.render('admin/login', { loginErr: req.session.loginErr = false })
})
router.post('/login', admin.login);
router.get('/home', (req, res) => {
    res.render('admin/home', { username: req.session.username })
})
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});
router.get('/verify')


module.exports = router;