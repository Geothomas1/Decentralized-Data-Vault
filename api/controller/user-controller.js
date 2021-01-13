'use strict';
const operator = require('../utils/operator');

const User = require('../models/user-schema');


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
                    return res.status(200).json({ status: 1, msg: req.body.username + ` enrolled and saved successfully` });
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
                            console.log('Something went wrong');
                            req.session.loginErr = true;
                            return res.render('user/login', { status: 0, loginErr: req.session.loginErr });
                        } else {
                            if (isMatch) {
                                console.log('<< Login Success >>');
                                req.session.username = usr.username;
                                req.session._id = usr._id;
                                console.log("_ID", req.session._id)
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
                                return res.render('user/login', { status: 0, loginErr: req.session.loginErr });
                            }
                        }
                    });
                } else {
                    console.log(req.username + ' doesnot exists');
                    req.session.loginErr = true;
                    return res.render('user/login', { status: 0, loginErr: req.session.loginErr });
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

    console.log(req.body)
    var orgname = req.body.orgName;
    var username = req.body.username;
    var channel = req.body.channelName;
    var chaincode = req.body.chaincodeName;
    var fcn = req.body.fcn;
    var phone = req.body.phone;
    var email = req.body.email;
    var id = req.session._id;
    var args = [id, username, email, phone]
    let result = await operator.createAsset(orgname, username, channel, chaincode, fcn, args)
    res.render('user/home', { username: req.session.username })

};

exports.viewData = async(req, res) => {
    console.log(req.session.username);
    var userorg = req.query.orgName;
    var username = req.session.username;
    var channel = req.query.channelName;
    var chaincode = req.query.chaincodeName;
    var fcn = req.query.fcn;
    var id = req.session._id;
    var args = [id];
    let result = await operator.queryAsset(userorg, username, channel, chaincode, fcn, args)
    console.log(result)

    res.render('user/viewData', { username: req.session.username, email: result.result.email, phone: result.result.phone })

}
exports.viewHistory = async(req, res) => {

    console.log(req.session.username);
    var userorg = req.query.orgName;
    var username = req.session.username;
    var channel = req.query.channelName;
    var chaincode = req.query.chaincodeName;
    var fcn = req.query.fcn;
    var id = req.session._id;
    var args = [id];
    let result = await operator.getHistory(userorg, username, channel, chaincode, fcn, args)
    console.log(result)


}