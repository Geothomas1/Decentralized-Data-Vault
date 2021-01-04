'use strict';
const helper = require('../utils/helper');

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

exports.register = async (req, res) => {
    console.log('In register', req.body);
    if (!req.body.username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!req.body.orgname) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }
    let response = await helper.registerUser(req.body.orgname, req.body.username, req.body.password);
    if (response && typeof response !== 'string') {
        res.json({ success: true, message: response });
    } else {
        res.json({ success: false, message: response });
    }
};

exports.login = async (req, res) => {
    console.log('In login', req.body);
    let response = await helper.loginUser(req.body.orgname, req.body.username, req.body.password);
    res.send(response);
};