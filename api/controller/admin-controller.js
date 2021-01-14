'use strict';
const operator = require('../utils/operator');

exports.login = async(req, res) => {
    console.log('Admin login', req.body);
    if (req.body.username && req.body.password) {
        if (req.body.username == 'admin' && req.body.password == 'admin') {
            req.session.username = 'admin';
            req.session.save(err => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/admin/home');
                }
            });
        }
    } else {
        console.log('Invalid format');
        req.session.loginErr = true
        return res.render('admin/login', { status: 0, loginErr: req.session.loginErr })
    }
};
exports.viewInsts = async(req, res) => {
    let result = await operator.queryAsset('Org1', 'admin', 'mychannel', 'institution', 'queryAllInstsData', [0])
    console.log(result.result)

}