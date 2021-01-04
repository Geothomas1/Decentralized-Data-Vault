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
        const users = [
            {
                username: 'blue',
                password: 'Toyota',
                orgname: 'Org1',
            },
            {
                username: 'red',
                password: 'Ford',
                orgname: 'Org2',
            },
            {
                username: 'green',
                password: 'Hyundai',
                orgname: 'Org1',
            },
            {
                username: 'yellow',
                password: 'Volkswagen',
                orgname: 'Org2',
            },
            {
                username: 'black',
                password: 'Tesla',
                orgname: 'Org1',
            },
            {
                username: 'purple',
                password: 'Peugeot',
                orgname: 'Org2',
            },
            {
                username: 'white',
                password: 'Chery',
                orgname: 'Org1',
            },
            {
                username: 'violet',
                password: 'Fiat',
                orgname: 'Org2',
            },
            {
                username: 'indigo',
                password: 'Tata',
                orgname: 'Org1',
            },
            {
                username: 'brown',
                password: 'Holden',
                orgname: 'Org2',
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

    async createUser(ctx, userNumber, username, password, orgname) {
        console.info('============= START : Create User ===========');
        const user = {
            username,
            password,
            orgname,
            docType: 'user',
        };
        await ctx.stub.putState(userNumber, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User ===========');
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
