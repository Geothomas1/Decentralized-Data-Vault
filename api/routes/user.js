var express = require('express');
var router = express.Router();

router.get('/home', (req, res) => {
    console.log('home');
    console.log('session', req.session);
    return res.render('user/userHome', { username: req.session.user })
});

module.exports = router;