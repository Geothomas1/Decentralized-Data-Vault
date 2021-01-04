'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets } = require('fabric-network');
const helper = require('./helper');

const queryUserById = async (userorg, username, userid) => {
    let ccp = await helper.getCCP(userorg);
    const caURL = await helper.getCaUrl(userorg, ccp);
    const ca = new FabricCAServices(caURL);
    const walletPath = await helper.getWalletPath(userorg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} exists in the wallet`);
        try {
            const connectOptions = {
                wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            };
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            const network = await gateway.getNetwork('mychannel');
            const contract = network.getContract('user');
            let result = await contract.evaluateTransaction('queryUserById', userid);
            await gateway.disconnect();
            return {
                result: JSON.parse(Buffer.from(result).toString('utf8')),
                status: 200,
            };
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return error.message;
        }
    } else {
        console.log(`No identity for the user ${username} exists in the wallet`);
        return {
            message: username + ' doesnot exists',
            status: 209,
        };
    }
};

const createUser = ()=>{};

module.exports = {
    queryUserById: queryUserById,
};