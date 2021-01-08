'use strict';
const operator = require('../utils/operator');

const User = require('../models/user-schema');


exports.register = async (req, res) => {
    console.log('In register', req.body);
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

exports.login = async (req, res) => {
    //req.session.loginErr = false;
    console.log('In login', req.body);

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

                            //return res.status(500).json({ status: 0, msg: 'Something went wrong' });
                            return res.render('user/login', { status: 0, loginErr: req.session.loginErr });
                        } else {
                            if (isMatch) {
                                console.log('<< Login Success >>');
                                req.session.usr = usr;
                                console.log('user Usr !!', req.session.usr)
                                req.session.username = usr.username;
                                console.log(req.session.username)
                                req.session.save();
                                return res.render('user/userHome', { username: req.session.username })
                            } else {
                                console.log('Password incorrect');
                                req.session.loginErr = true
                                return res.render('user/login', { status: 0, loginErr: req.session.loginErr })
                                //return res.status(500).json({ status: 0, msg: 'Password incorrect' });
                            }
                        }
                    });
                } else {
                    console.log(req.username + ' doesnot exists');
                    req.session.loginErr = true
                    return res.render('user/login', { status: 0, loginErr: req.session.loginErr })
                    //return res.status(404).json({ status: 0, msg: req.username + ' doesnot exists' });
                }
            }
        });
    } else {
        console.log('Invalid format');
        req.session.loginErr = true
        return res.render('user/login', { status: 0, loginErr: req.session.loginErr })
        //return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};

exports.addData = async(req, res) => {


}