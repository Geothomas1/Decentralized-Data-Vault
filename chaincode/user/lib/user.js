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
                username: 'User0',
                email: 'testd0@gmail.com',
                phone: '9999999990',
            },
            {
                username: 'User1',
                email: 'testd1@gmail.com',
                phone: '9999999991',
            },
            {
                username: 'User2',
                email: 'testd2@gmail.com',
                phone: '9999999992',
            },
            {
                username: 'User3',
                email: 'testd3@gmail.com',
                phone: '9999999993',
            },
            {
                username: 'User4',
                email: 'testd4@gmail.com',
                phone: '9999999994',
            },
            {
                username: 'User5',
                email: 'testd5@gmail.com',
                phone: '9999999995',
            },
            {
                username: 'User6',
                email: 'testd6@gmail.com',
                phone: '9999999996',
            },
            {
                username: 'User7',
                email: 'testd7@gmail.com',
                phone: '9999999997',
            },
            {
                username: 'User8',
                email: 'testd8@gmail.com',
                phone: '9999999998',
            },
            {
                username: 'User9',
                email: 'testd9@gmail.com',
                phone: '9999999999',
            },
        ];

        for (let i = 0; i < users.length; i++) {
            users[i].docType = 'user';
            await ctx.stub.putState('USER' + i, Buffer.from(JSON.stringify(users[i])));
            console.info('Added <--> ', users[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryUser(ctx, userNumber) {
        const userAsBytes = await ctx.stub.getState(userNumber);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userNumber} does not exist`);
        }
        console.log(userAsBytes.toString());
        return userAsBytes.toString();
    }

    async createUser(ctx, userNumber, username, email, phone) {
        console.info('============= START : Create User ===========');
        const user = {
            username,
            email,
            phone,
            docType: 'user',
        };
        await ctx.stub.putState(userNumber, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User Success ===========');
    }

    async queryUserById(ctx, userName) {
        console.info('============= START : queryUserById ===========');
        const userAsBytes = await ctx.stub.getState(userName);
        if (!userAsBytes || userAsBytes.length === 0) {
            return;
        }
        return userAsBytes.toString();
    }
}

module.exports = User;