var express = require('express');
var admin = require('../controller/admin-controller');
var router = express.Router();

router.get('/login', (req, res) => {
        res.render('admin/login', { loginErr: req.session.loginErr = false })
    })
    //router.post('/login', admin.login);



module.exports = router;