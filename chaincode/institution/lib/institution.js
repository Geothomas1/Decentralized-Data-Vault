/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Institution extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const instns = [{
                key: '5ffd7158e71ab969f7cabfef',
                data: {
                    name: 'Mahathma Gandhi University',
                    code: 'MGU',
                    type: 'University',
                    address: 'Priyadarsini Hills',
                    district: 'Kottayam',
                    state: 'Kerala',
                    pincode: '686560',
                    phone: '+9104852554570',
                    email: 'mgu@mgu.ac.in',
                    owner: 'Government of Kerala',
                    status: '0',
                    privileges: [{
                        _id: '11aaj',
                        name: 'Provide qualification for the citizens',
                        status: 0,
                    }, ],
                }
            },
            {
                key: '5ffd734bcc5dfa3b4e888282',
                data: {
                    name: 'Lovely Professional University',
                    code: 'LPU',
                    type: 'University',
                    address: 'Jalandhar - Delhi G.T. Road',
                    district: 'Phagwara',
                    state: 'Punjab',
                    pincode: '144411',
                    phone: '+911824517000',
                    email: 'info@lpu.co.in',
                    owner: 'Private',
                    status: '0',
                    privileges: [],
                }
            },
        ];

        for (let i = 0; i < instns.length; i++) {
            instns[i].data.docType = 'institution';
            await ctx.stub.putState(instns[i].key, Buffer.from(JSON.stringify(instns[i].data)));
            console.info('Added <--> ', instns[i]);
        }
        console.info('============= END : Initialize Ledger Key ===========');
    };

    async createInstn(ctx, key, name, code, type, address, district, state, pincode, phone, email, owner, status) {
        console.info('============= START : Create Institutions ===========');
        const user = {
            name,
            code,
            type,
            address,
            district,
            state,
            pincode,
            phone,
            email,
            owner,
            status,
            privileges: [],
            docType: 'institution',
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        let txt_id = ctx.stub.getTxID();
        console.info('============= END : Create Institutions ===========');
        return JSON.stringify(txt_id);
    };

    async queryInstn(ctx, key) {
        console.info('============= START : Query Institutions ===========');
        const instnAsBytes = await ctx.stub.getState(key);
        if (!instnAsBytes || instnAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        console.info('============= END : Query Institutions ===========');
        return instnAsBytes.toString();
    };

    async queryAllInstn(ctx) {
        console.info('============= START : Query All Institutions ===========');
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
        console.info('============= END : Query All Institutions ===========');
        return JSON.stringify(allResults);
    };

    async addInstnPrevilege(ctx, key, prvlgId, prvlgName, prvlgStatus) {
        console.info('============= START : Add Previlege ===========');
        const instnAsBytes = await ctx.stub.getState(key);
        if (!instnAsBytes || instnAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        const instn = JSON.parse(instnAsBytes.toString());
        instn.privileges.push({
            _id: prvlgId,
            name: prvlgName,
            status: prvlgStatus,
        });
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(instn)));
        console.info('============= END : Add Previlege ===========');
    };

    async updateInstnStatus(ctx, key, status) {
        console.info('============= START : Update Institution Status ===========');
        const InstnAsBytes = await ctx.stub.getState(key);
        if (!InstnAsBytes || InstnAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        const instn = JSON.parse(InstnAsBytes.toString());
        instn.status = status;
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(instn)));
        console.info('============= END : Update Institution Status ===========');
    };

    async updateInstnPrevilege(ctx, key, prvlgId, prvlgStatus){
        console.info('============= START : Update Previlege ===========');
        const InstnAsBytes = await ctx.stub.getState(key);
        if (!InstnAsBytes || InstnAsBytes.length === 0) {
            throw new Error(`${key} does not exist`);
        }
        const instn = JSON.parse(InstnAsBytes.toString());
        instn.privileges.forEach(item => {
            if(item._id == prvlgId){
                item.status = prvlgStatus;
            }
        });
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(instn)));
        console.info('============= END : Update Previlege ===========');
    };

}

module.exports = Institution;