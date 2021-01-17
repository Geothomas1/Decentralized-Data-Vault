'use strict';
const operator = require('../utils/operator');

const User = require('../models/user-schema');

const makeid = (length) => {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

exports.checkUser = (req, res, next) => {
    console.log('In checkUser', req.session);
    User.findOne({ _id: req.session.user._id }, (err, usr) => {
        if (err) {
            console.log(err.msg);
            return res.status(500).json({ status: 0, msg: err.msg });
        } else {
            if (usr) {
                req.user = usr;
                next();
            } else {
                console.log(req.session.user.username + ' not found');
                return res.status(404).json({ status: 0, msg: req.session.user.username + ' not found' });
            }
        }
    });
};

exports.register = async(req, res) => {
    console.log('In user register', req.body);
    if (req.body.orgname && req.body.username && req.body.password) {
        let result = await operator.enrollUser(req.body.orgname, req.body.username);
        console.log('result', result);
        if (result.status == 0) {
            console.log(result.msg);
            return res.status(409).json({ status: 1, msg: result.msg });
        } else if (result.status == 1) {
            let newUser = new User({
                username: req.body.username,
                organization: req.body.orgname,
                password: req.body.password
            });
            newUser.save((err, usr) => {
                if (err) {
                    console.log(err.msg);
                    return res.status(500).json({ status: 0, msg: err.msg });
                } else {
                    console.log('User saved successfully', usr);
                    req.session.loginErr = false;
                    return res.render('user/login', { status: 0, success: 1, loginErr: req.session.loginErr });
                    //return res.status(200).json({ status: 1, msg: req.body.username + ` enrolled and saved successfully` });

                }
            });
        } else {
            console.log(result.msg);
            req.body;
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.login = async(req, res) => {
    console.log('In user login', req.body);
    if (req.body.username && req.body.password) {
        User.findOne({ username: req.body.username }, (err, usr) => {
            if (err) {
                console.log(err.msg);
                return res.status(500).json({ status: 0, msg: err.msg });
            } else {
                if (usr) {
                    console.log('user', usr);
                    usr.comparePassword(req.body.password, (err, isMatch) => {
                        if (err) {
                            console.log(err.msg);
                            req.session.loginErr = true;
                            return res.render('user/login', { status: 0, success: 0, loginErr: req.session.loginErr });
                        } else {
                            if (isMatch) {
                                console.log('<< Login Success >>');
                                req.session.user = {
                                    _id: usr._id,
                                    username: usr.username
                                };
                                console.log('session !!', req.session);

                                req.session.save(err => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.redirect('/user/home');
                                    }
                                });
                            } else {
                                console.log('Password incorrect');
                                req.session.loginErr = true
                                return res.render('user/login', { status: 0, success: 0, loginErr: req.session.loginErr });
                            }
                        }
                    });
                } else {
                    console.log(req.username + ' not found');
                    req.session.loginErr = true;
                    return res.render('user/login', { status: 0, success: 0, loginErr: req.session.loginErr });
                }
            }
        });
    } else {
        console.log('Invalid format');
        req.session.loginErr = true
        return res.render('user/login', { status: 0, loginErr: req.session.loginErr })
    }
};

exports.addData = async(req, res) => {
    console.log('In user addData', req.body);
    if (req.body.name && req.body.address && req.body.city && req.body.district && req.body.state && req.body.email && req.body.phone && req.body.dob) {
        let result = await operator.createAsset(req.user.organization, req.user.username, 'mychannel', 'user', 'createUser', [
            req.user._id,
            req.body.name,
            req.body.address,
            req.body.city,
            req.body.district,
            req.body.state,
            req.body.email,
            req.body.phone,
            req.body.dob,
            0
        ]);
        console.log('result :', result);
        if (result.status == 1) {
            res.redirect('/user/home');
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
    console.log('In user viewData');
    let result = await operator.queryAsset(req.user.organization, req.user.username, 'mychannel', 'user', 'queryUser', [req.user._id]);
    console.log('result :', result);
    if (result.status == 1) {
        res.render('user/viewData', { username: req.session.user.username, email: result.result.email, phone: result.result.phone });
    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
};

exports.viewHistory = async(req, res) => {
    console.log('In user viewHistory', req.user);
    let result = await operator.queryAsset(req.user.organization, req.user.username, 'mychannel', 'user', 'queryUserHistory', [req.user._id]);
    console.log('result :', result.result);
    if (result.status == 1) {
        res.render('user/viewHistory', { username: req.session.user.username, history: result.result });
    } else {
        console.log(result.msg);
        return res.status(500).json({ status: 0, msg: result.msg });
    }
};

exports.showInstitutions = async(req, res) => {
    console.log('In user showInstitutions');
    let result = await operator.queryAsset(req.user.organization, req.user.username, 'mychannel', 'institution', 'queryAllInstn', [0]);
    console.log('result :', result.result);

    console.log("Check Application already");
    let result2 = await operator.queryAsset(req.user.organization, req.user.username, 'mychannel', 'user', 'queryUser', [req.user._id]);
    console.log('result2 :', result2.result.applications.length);
    var applicationsLen = result2.result.applications.length;
    if (applicationsLen == 0) {
        res.render('user/serviceList', { username: req.session.user.username, data: result.result, status: -1 });
    } else {

        for (var i = 0; i < applicationsLen; i++) {
            console.log('result :', result2.result.applications[i])
            if (result2.result.applications[i].status == 0) {
                res.render('user/serviceList', { username: req.session.user.username, data: result.result, status: 0 })
            } else if (result2.result.applications[i].status == 1) {
                res.render('user/serviceList', { username: req.session.user.username, data: result.result, status: 1 })
            }
        }
    }


};

exports.applyService = async(req, res) => {
    console.log('In user applyService', req.body);
    if (req.body.key) {

        let result = await operator.updateAsset(req.user.organization, req.user.username, 'mychannel', 'user', 'addUserApplication', [req.user._id, makeid(6), req.body.key, 0]);
        console.log('result :', result);
        if (result.status == 1) {
            res.render('user/home', { username: req.session.user.username })
        } else {
            console.log(result.msg);
            return res.status(500).json({ status: 0, msg: result.msg });
        }
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};