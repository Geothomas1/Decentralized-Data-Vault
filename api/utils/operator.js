'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets } = require('fabric-network');
const helper = require('./helper');

const enrollUser = async (orgname, username) => {
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
            wallet,
            identity: username,
            discovery: { enabled: true, asLocalhost: true },
        };
        try {
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            const network = await gateway.getNetwork(channel);
            const contract = network.getContract(chaincode);
            let result = await contract.submitTransaction(fcn, args[0], args[0], args[1], args[2]);
            await gateway.disconnect();
            return {
                status: 1,
                msg: `Asset added successfully`,
                value: result
            };
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return {
                status: -1,
                msg: error.message
            };
        }
    } else {
        console.log(`No identity for the user ${username} exists in the wallet`);
        return {
            status: 0,
            msg: username + ' not enrolled',
        };
    }
};

const queryAsset = async (userorg, username, channel, chaincode, fcn, args) => {
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
            const network = await gateway.getNetwork(channel);
            const contract = network.getContract(chaincode);
            let result = await contract.evaluateTransaction(fcn, args[0]);
            await gateway.disconnect();
            return {
                result: JSON.parse(Buffer.from(result).toString('utf8')),
                status: 200,
            };
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return {
                status: -1,
                msg: error.message
            };
        }
    } else {
        console.log(`No identity for the user ${username} exists in the wallet`);
        return {
            status: 0,
            msg: username + ' not enrolled',
        };
    }
};


module.exports = {
    enrollUser: enrollUser,
    createAsset: createAsset,
    queryAsset: queryAsset,
};