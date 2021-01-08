'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets } = require('fabric-network');
const helper = require('./helper');

const queryUserById = async(userorg, username, userid) => {
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
                wallet,
                identity: username,
                discovery: { enabled: true, asLocalhost: true },
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

const enrollUser = async(orgname, username) => {
    let ccp = await helper.getCCP(orgname);
    const caURL = await helper.getCaUrl(orgname, ccp);
    const ca = new FabricCAServices(caURL);
    const walletPath = await helper.getWalletPath(orgname);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        return {
            status: 0,
            msg: username + ' already enrolled',
        };
    } else {
        try {
            let adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                await helper.enrollAdmin(orgname, ccp);
                adminIdentity = await wallet.get('admin');
                console.log("Admin Enrolled Successfully");
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');
            let secret;
            try {
                secret = await ca.register({ affiliation: await helper.getAffiliation(orgname), enrollmentID: username, role: 'client' }, adminUser);
            } catch (error) {
                return {
                    status: -1,
                    msg: error.message
                };
            }

            const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });

            let x509Identity;
            if (orgname == "Org1") {
                x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: 'Org1MSP',
                    type: 'X.509',
                };
            } else if (orgname == "Org2") {
                x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: 'Org2MSP',
                    type: 'X.509',
                };
            }

            await wallet.put(username, x509Identity);
            console.log(`Successfully registered and enrolled user ${username} and imported it into the wallet`);
            return {
                status: 1,
                msg: username + ' enrolled Successfully'
            };
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return {
                status: -1,
                msg: error.message
            };
        }
    }
};

<<<<<<< HEAD

=======
const createAsset = async (orgname, username, channel, chaincode, fcn, args) => {
    let ccp = await helper.getCCP(orgname);
    const caURL = await helper.getCaUrl(orgname, ccp);
    const ca = new FabricCAServices(caURL);
    const walletPath = await helper.getWalletPath(orgname);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
        };
        try {
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            if (channel == 'channelName1') {
                const network = await gateway.getNetwork('channelName1');
                if (chaincode == 'chaincodeName1') {
                    const contract = network.getContract('chaincodeName1');
                    switch (fcn) {
                        case 'fcn1':
                            let result = await contract.submitTransaction('fcn1', args[0], args[1], args[2], args[3]);
                            await gateway.disconnect();
                            return {
                                status: 1,
                                msg: `Asset added successfully, channel : channelName1, chaincode : chaincodeName1, fcn : fcn1`,
                                value: result
                            };
                        default:
                            return {
                                status: 0,
                                msg: `Fcn not found, channel : channelName1, chaincode : chaincodeName1, fcn : ${fcn}`,
                            };
                    }
                } else if (chaincode == 'chaincodeName2') {
                    //code for next chaincode
                } else {
                    return {
                        status: 0,
                        msg: `Chaincode not found, channel : channelName1, chaincode : ${chaincode}`,
                    };
                }
            } else if (channel == 'channelName2') {
                //code for next channel
            } else {
                return {
                    status: 0,
                    msg: `Channel not found, channel : ${channel}`,
                };
            }
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return {
                status: -1,
                msg: error.message
            };
        }
    } else {
        console.log(`Identity for the user ${username} doesn't exists in the wallet`);
        return {
            status: 0,
            msg: username + ' not enrolled',
        };
    }

};
>>>>>>> refs/remotes/origin/main

module.exports = {
    // queryUserById: queryUserById,
    enrollUser: enrollUser,
    createAsset: createAsset,
};