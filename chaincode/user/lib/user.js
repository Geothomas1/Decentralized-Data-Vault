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
            _id: '5ffea850821d59360f7bfcc5',
            data: {
                username: 'User0',
                email: 'user0@gmail.com',
                phone: '9999999990',
            }
        }, {
            _id: '5ffec1685eb00973ce6ce819',
            data: {
                username: 'User1',
                email: 'user1@gmail.com',
                phone: '9999999991',
            }
        }, ];

        for (let i = 0; i < users.length; i++) {
            users[i].data.docType = 'user';
            await ctx.stub.putState(users[i]._id, Buffer.from(JSON.stringify(users[i].data)));
            console.info('Added <--> ', users[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryUser(ctx, _id) {
        console.info('============= START : Query User ===========');
        const userAsBytes = await ctx.stub.getState(_id);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${_id} does not exist`);
        }
        console.log(userAsBytes.toString());
        console.info('============= END : Query User Success ===========');
        return userAsBytes.toString();
    }

    async createUser(ctx, _id, username, email, phone) {
        console.info('============= START : Create User ===========');
        const user = {
            username,
            email,
            phone,
            docType: 'user',
        };
        await ctx.stub.putState(_id, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User Success ===========');
    }

    async queryUserHistory(ctx, _id) {
        console.info('============= START : Query User History ===========');
        const promiseOfIterator = ctx.stub.getHistoryForKey(_id);
        const results = [];
        for await (const keyMod of promiseOfIterator) {
            const resp = {
                timestamp: ctx.stub.getTxTimestamp(_id),
                txid: ctx.stub.getTxID(_id)
            }
            if (keyMod.is_delete) {
                resp.data = 'KEY DELETED';
            } else {
                resp.data = keyMod.value.toString('utf8');
            }
            results.push(resp);
        }
        return results;
    }

}

module.exports = User;