'use strict';
const operator = require('../utils/operator');

const Instn = require('../models/instn-schema');

const makeid = (length) => {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

exports.checkInstn = (req, res, next) => {
    console.log('In checkInstn', req.session);
    Instn.findOne({ _id: req.session.user._id }, (err, inst) => {
        if (err) {
            console.log(err.msg);
            return res.status(500).json({ status: 0, msg: err.msg });
        } else {
            if (inst) {
                req.user = inst;
                next();
            } else {
                console.log(req.session.user.username + ' not found');
                return res.status(404).json({ status: 0, msg: req.session.user.username + ' not found' });
            }
        }
    });
};

exports.register = async(req, res) => {
    console.log('In institution register', req.body);
    if (req.body.orgname && req.body.username && req.body.password) {
        let result = await operator.enrollUser(req.body.orgname, req.body.username);
        console.log('result', result);
        if (result.status == 0) {
            console.log(result.msg);
            return res.status(409).json({ status: 1, msg: result.msg });
        } else if (result.status == 1) {
            let newInstn = new Instn({
                username: req.body.username,
                organization: req.body.orgname,
                password: req.body.password
            });
            newInstn.save((err, usr) => {
                if (err) {
                    console.log(err.msg);
                    return res.status(500).json({ status: 0, msg: err.msg });
                } else {
                    console.log('Institution saved successfully', usr);
                    req.session.loginErr = false;
                    return res.render('instn/login', { status: 0, success: 1, loginErr: req.session.loginErr });
                    //return res.status(200).json({ status: 1, msg: req.body.username + ` enrolled and saved successfully` });
                }
            });
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.login = async(req, res) => {
    console.log('In institution login', req.body);
    if (req.body.username && req.body.password) {
        Instn.findOne({ username: req.body.username }, (err, inst) => {
            if (err) {
                console.log(err.msg);
                return res.status(500).json({ status: 0, msg: err.msg });
            } else {
                if (inst) {
                    console.log('institution', inst);
                    inst.comparePassword(req.body.password, (err, isMatch) => {
                        if (err) {
                            console.log('Something went wrong');
                            req.session.loginErr = true;
                            return res.render('instn/login', { status: 0, success: 0, loginErr: req.session.loginErr });
                        } else {
                            if (isMatch) {
                                console.log('<< Login Success >>');
                                req.session.user = {
                                    _id: inst._id,
                                    username: inst.username
                                };
                                console.log('session !!', req.session);

                                req.session.save(err => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.redirect('/instn/home');
                                    }
                                });
                            } else {
                                console.log('Password incorrect');
                                req.session.loginErr = true
                                return res.render('instn/login', { status: 0, success: 0, loginErr: req.session.loginErr });
                            }
                        }
                    });
                } else {
                    console.log(req.username + ' doesnot exists');
                    req.session.loginErr = true;
                    return res.render('instn/login', { status: 0, success: 0, loginErr: req.session.loginErr });
                }
            }
        });
    } else {
        console.log('Invalid format');
        req.session.loginErr = true
        return res.render('instn/login', { status: 0, loginErr: req.session.loginErr })
    }
};

exports.addData = async(req, res) => {
    console.log('In institution addData', req.body);
    if (req.body.name && req.body.code && req.body.type && req.body.address && req.body.district && req.body.state && req.body.pincode && req.body.phone && req.body.email && req.body.owner) {
        let result = await operator.createAsset(req.user.organization, req.user.username, 'mychannel', 'institution', 'createInstn', [
            req.user._id,
            req.body.name,
            req.body.code,
            req.body.type,
            req.body.address,
            req.body.district,
            req.body.state,
            req.body.pincode,
            req.body.phone,
            req.body.email,
            req.body.owner,
            0
        ]);
        console.log('result : ', result);
        if (result.status == 1) {
            res.redirect('/instn/home');
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.viewData = async(req, res) => {
    console.log('In institution viewData');
    let result = await operator.queryAsset(req.user.organization, req.user.username, 'mychannel', 'institution', 'queryInstn', [req.user._id]);
    console.log('result :', result);
    if (result.status == 1) {
        //returning data
    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
};

exports.showPrivilege = async(req, res) => {
    console.log('In institution showPrivilege');
    let result = await operator.queryAsset(req.user.organization, req.user.username, 'mychannel', 'institution', 'queryInstn', [req.user._id]);
    console.log('result :', result);
    console.log('result.result.privileges.length', result.result.privileges.length)
        //console.log('result.result.privileges.status', result.result.privileges[0].status)
    if (result.status == 1 && result.result.privileges.length == 0) {
        console.log('Prev is empty')
        res.render('instn/requestPrivilege', { username: req.session.user.username, data: result.result, track: 0 })
    } else if (result.status == 1 && result.result.privileges[0].status == 0) {
        console.log('Prev is not empty')
        res.render('instn/requestPrivilege', { username: req.session.user.username, data: result.result, track: 1 })

    }
    if (result.status == 1 && result.result.privileges[0].status == 1) {
        console.log('Prev is not empty')
        res.render('instn/requestPrivilege', { username: req.session.user.username, data: result.result, track: 2 })

    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
};

exports.requestPrivilege = async(req, res) => {
    console.log('In institution requestPrivilege', req.body);
    if (req.body.desc) {
        let result = await operator.updateAsset(req.user.organization, req.user.username, 'mychannel', 'institution', 'addInstnPrevilege', [req.user._id, makeid(5), req.body.desc, 0]);
        console.log('result :', result);
        if (result.status == 1) {
            res.redirect('/instn/home');
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
}