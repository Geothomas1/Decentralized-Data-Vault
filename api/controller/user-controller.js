'use strict';
const operator = require('../utils/operator');

const User = require('../models/user-schema');

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

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
                            return res.status(500).json({ status: 0, msg: 'Something went wrong' });
                        } else {
                            if (isMatch) {
                                console.log('yes');
                            } else {
                                console.log('Password incorrect');
                                return res.status(500).json({ status: 0, msg: 'Password incorrect' });
                            }
                        }
                    });
                } else {
                    console.log(req.username + ' doesnot exists');
                    return res.status(404).json({ status: 0, msg: req.username + ' doesnot exists' });
                }
            }
        });
    } else {
        console.log('Invalid format');
        return res.status(403).json({ status: 0, msg: 'Invalid Data Format' });
    }
};