var express = require('express');
var user = require('../controller/user-controller');
var router = express.Router();

router.get('/register', (req, res) => res.render('user/register'));
router.post('/register', user.register);

router.get('/login', (req, res) => res.render('user/login', { loginErr: req.session.loginErr = false, success: 0 }));
router.post('/login', user.login);

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/user/login');
});

router.get('/home', (req, res) => res.render('user/home', { username: req.session.user.username }));

router.get('/addData', (req, res) => res.render('user/addData', { username: req.session.user.username }));
router.post('/addData', user.checkUser, user.addData);

router.get('/getData', (req, res) => res.render('user/getData', { username: req.session.user.username }));
router.get('/viewData', user.checkUser, user.viewData);

router.get('/getHistory', (req, res) => res.render('user/getHistory', { username: req.session.user.username }));
router.get('/viewHistory', user.checkUser, user.viewHistory);

router.get('/applyService', user.checkUser, user.showInstitutions);
router.post('/applyService', user.checkUser, user.applyService);




module.exports = router;