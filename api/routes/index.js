var express = require('express');
var router = express.Router();
var user = require('../controller/user-controller');
var institution = require('../controller/institusion-controller')
router.get('/', (req, res) => res.render('index'));
router.get('/register', (req, res) => {
    res.render('user/register')
});

router.get('/iregister', (req, res) => {
    res.render('institution/iregister')
})

router.post('/iregister', institution.iregister)

router.get('/login', (req, res) => {
    res.render('user/login', { loginErr: req.session.loginErr = false })
});
router.post('/register', user.register);

router.post('/login', user.login);
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/addData', (req, res) => {
    res.render('user/addData', { username: req.session.username });
});
router.post('/addData', user.addData);

router.get('/getData', (req, res) => {
    res.render('user/getData', { username: req.session.username })
});

router.get('/viewData', user.viewData);

router.get('/getHistory', (req, res) => {
    res.render('user/getHistory', { username: req.session.username })
})
router.get('/viewHistory', user.viewHistory);

module.exports = router;