'use strict';
const operator = require('../utils/operator');

exports.login = async (req, res) => {
    console.log('In admin login', req.body);
    if (req.body.username && req.body.password) {
        if (req.body.username == 'admin' && req.body.password == 'admin') {
            req.session.user = { username: 'admin' };
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

exports.viewInsts = async (req, res) => {
    console.log('In admin viewInsts', req.body);
    let result = await operator.queryAsset('Org2', 'admin', 'mychannel', 'institution', 'queryAllInstn', [0]);
    console.log('result :', result.result);
    if (result.status == 1) {
        res.render('admin/verifyList', { username: req.session.user.username, data: result.result });
    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
};

exports.acceptOrRejectPrevilege = async (req, res) => {
    console.log('In admin acceptOrRejectPrevilege', req.body);
    if (req.body.key && req.body.pr_id && req.body.status) {
        var d = new Date();
        let result = await operator.updateAsset('Org2', 'admin', 'mychannel', 'institution', 'updateInstnPrevilege', [req.body.key, req.body.pr_id, req.body.status, d.toISOString()]);
        console.log('result :', result);
        if (result.status == 1) {
            //previlege granted result
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.verifyInstitution = async (req, res) => {
    console.log('In admin verifyInstitution', req.body);
    if (req.body.key && req.body.status) {
        var d = new Date();
        let result = await operator.updateAsset('Org2', 'admin', 'mychannel', 'institution', 'updateInstnStatus', [req.body.key, req.body.status, d.toISOString()]);
        console.log('result :', result);
        if (result.status == 1) {
            return res.status(200).json({ status: 1, msg: result.msg });
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.approvedList = async (req, res) => {
    console.log('Approved List of Institutions');
    let result = await operator.queryAsset('Org2', 'admin', 'mychannel', 'institution', 'queryAllInstn', [0]);
    console.log('result :', result.result);
    if (result.status == 1) {
        res.render('admin/approvedList', { username: req.session.user.username, data: result.result });
    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
}