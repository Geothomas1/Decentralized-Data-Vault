/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class User extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const users = [{
            key: '5ffea850821d59360f7bfcc5',
            data: {
                name: 'User0',
                address: 'Palamattom P.O',
                city: 'Kothamangalam',
                district: 'Ernakulam',
                state: 'Kerala',
                email: 'user0@gmail.com',
                phone: '9999999990',
                dob: '21-10-2020',
                status: 0,
                applications: [],
                date: "2021-01-18T14:02:58.846Z",
            }
        }, {
            key: '5ffec1685eb00973ce6ce819',
            data: {
                name: 'User1',
                address: 'Palamattom P.O',
                city: 'Kothamangalam',
                district: 'Ernakulam',
                state: 'Kerala',
                email: 'user1@gmail.com',
                phone: '9999999991',
                dob: '21-10-2020',
                status: 0,
                applications: [],
                date: "2021-01-18T14:02:58.846Z",
            }
        }, ];
        for (let i = 0; i < users.length; i++) {
            users[i].data.docType = 'user';
            await ctx.stub.putState(users[i].key, Buffer.from(JSON.stringify(users[i].data)));
            console.info('Added <--> ', users[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    };

    async createUser(ctx, key, name, address, city, district, state, email, phone, dob, status, date) {
        console.info('============= START : Create User ===========');
        const user = {
            name,
            address,
            city,
            district,
            state,
            email,
            phone,
            dob,
            status,
            applications: [],
            date: date,
            docType: 'user',
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User ===========');
    };


    async queryUser(ctx, key) {
        console.info('============= START : Query User ===========');
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        console.log(userAsBytes.toString());
        console.info('============= END : Query User ===========');
        return userAsBytes.toString();
    };

    async queryUserHistory(ctx, key) {
        console.info('============= START : Query User History ===========');
        const promiseOfIterator = ctx.stub.getHistoryForKey(key);
        const results = [];
        for await (const keyMod of promiseOfIterator) {
            const resp = {
                timestamp: ctx.stub.getTxTimestamp(key),
                txid: ctx.stub.getTxID(key)
            }
            if (keyMod.is_delete) {
                resp.data = 'KEY DELETED';
            } else {
                resp.data = keyMod.value.toString('utf8');
            }
            results.push(resp);
        }
        console.info('============= END : Query User History ===========');
        return results;
    };

    async queryAllUser(ctx) {
        console.info('============= START : Query All User ===========');
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value }
            of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        console.info('============= END : Query All User ===========');
        return JSON.stringify(allResults);
    };

    async addUserApplication(ctx, key, aplnId, instId, aplnStatus, date) {
        console.info('============= START : Add Application ===========');
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.applications.push({
            _id: aplnId,
            inst: instId,
            status: aplnStatus,
        });
        user.date = date;
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Add Application ===========');
    };

    async updateUserStatus(ctx, key, status, date) {
        console.info('============= START : Update User Status ===========');
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.status = status;
        user.date = date
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Update User Status ===========');
    };

    async addUserQualification(ctx, key, aplnId, instId, apStatus, date) {
        console.info('============= START : Update addUserQualification ===========');
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        if (apStatus == 1) {
            if (user.qualifications) {
                user.qualifications.push({
                    _id: aplnId,
                    inst: instId,
                    //add more qualification details
                });
            } else {
                user.qualifications = [{
                    _id: aplnId,
                    inst: instId,
                    //add more qualification details
                }];
            }
            user.date = date;
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        }
        console.info('============= END : Update addUserQualification ===========');
    };
};

module.exports = User;