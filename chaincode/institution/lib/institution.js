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
                _id: '5ffd7158e71ab969f7cabfef',
                data: {
                    name: 'Mahathma Gandhi University',
                    username: 'MGU',
                    type: 'University',
                    address: 'Priyadarsini Hills',
                    district: 'Kottayam',
                    state: 'Kerala',
                    pincode: '686560',
                    phone: '+9104852554570',
                    email: 'mgu@mgu.ac.in',
                    owner: 'Government of Kerala',
                }
            },
            {
                _id: '5ffd734bcc5dfa3b4e888282',
                data: {
                    name: 'Lovely Professional University',
                    username: 'LPU',
                    type: 'University',
                    address: 'Jalandhar - Delhi G.T. Road',
                    district: 'Phagwara',
                    state: 'Punjab',
                    pincode: '144411',
                    phone: '+911824517000',
                    email: 'info@lpu.co.in',
                    owner: 'Private',
                }
            },
        ];

        for (let i = 0; i < instns.length; i++) {
            instns[i].docType = 'institution';
            await ctx.stub.putState(instns[i]._id, Buffer.from(JSON.stringify(instns[i].data)));
            console.info('Added <--> ', instns[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createInstns(ctx, userNumber, id, username, name, type, address, district, state, pincode, phone, email, owner) {
        console.info('============= START : Create Instns ===========');
        const user = {
            id,
            username,
            name,
            type,
            address,
            district,
            state,
            pincode,
            phone,
            email,
            owner,
            docType: 'instns',
        };
        await ctx.stub.putState(userNumber, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create Instns Success ===========');
    }

    async queryInstnsById(ctx, id) {
        console.info('============= START : querInstnsById ===========');
        const userAsBytes = await ctx.stub.getState(id);
        if (!userAsBytes || userAsBytes.length === 0) {
            return;
        }
        return userAsBytes.toString();
    }

    // async queryCar(ctx, carNumber) {
    //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    //     if (!carAsBytes || carAsBytes.length === 0) {
    //         throw new Error(`${carNumber} does not exist`);
    //     }
    //     console.log(carAsBytes.toString());
    //     return carAsBytes.toString();
    // }


    // async queryAllCars(ctx) {
    //     const startKey = '';
    //     const endKey = '';
    //     const allResults = [];
    //     for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
    //         const strValue = Buffer.from(value).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push({ Key: key, Record: record });
    //     }
    //     console.info(allResults);
    //     return JSON.stringify(allResults);
    // }

    // async changeCarOwner(ctx, carNumber, newOwner) {
    //     console.info('============= START : changeCarOwner ===========');

    //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    //     if (!carAsBytes || carAsBytes.length === 0) {
    //         throw new Error(`${carNumber} does not exist`);
    //     }
    //     const car = JSON.parse(carAsBytes.toString());
    //     car.owner = newOwner;

    //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    //     console.info('============= END : changeCarOwner ===========');
    // }

}

module.exports = Institution;