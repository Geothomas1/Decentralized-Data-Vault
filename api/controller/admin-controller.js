'use strict';
const operator = require('../utils/operator');

exports.login = async(req, res) => {
    console.log('In admin login', req.body);
    if (req.body.username && req.body.password) {
        if (req.body.username == 'admin' && req.body.password == 'admin') {
            req.session.user = {username :'admin'};
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
        req.session.loginErr = true;
        return res.render('admin/login', { status: 0, loginErr: req.session.loginErr });
    }
};

exports.viewInsts = async(req, res) => {
    console.log('In admin viewInsts', req.body);
    let result = await operator.queryAsset('Org2', 'admin', 'mychannel', 'institution', 'queryAllInstn', [0]);
    console.log('result :', result.result);
    if (result.status == 1) {
        res.render('admin/verifyList', { username: req.session.user.username, data: result.result});
    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
};

exports.acceptOrRejectPrevilege = async (req, res) => {
    console.log('In admin acceptPrevilege', req.body);
    if(req.body.key && req.body.pr_id && req.body.status){
        let result = await operator.updateAsset('Org2', 'admin', 'mychannel', 'institution', 'setPrevilege', [req.body.key, req.body.pr_id, req.body.status]);
        if (result.status == 1) {

        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else{
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};