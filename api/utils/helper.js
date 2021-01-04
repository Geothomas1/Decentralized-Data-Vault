'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const getCCP = (org) => {
    let ccpPath;
    if (org == "Org1") {
        ccpPath = path.resolve(__dirname, '..', '..', '..', 'Decentralized-Data-Vault', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    } else if (org == "Org2") {
        ccpPath = path.resolve(__dirname, '..', '..', '..', 'Decentralized-Data-Vault', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
    } else
        return null;
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);
    return ccp;
};

const getCaUrl = async (org, ccp) => {
    let caURL;
    if (org == "Org1") {
        caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    } else if (org == "Org2") {
        caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
    } else
        return null;
    return caURL;
}

const getWalletPath = async (org) => {
    let walletPath;
    if (org == "Org1") {
        walletPath = path.join(process.cwd(), 'org1-wallet');
    } else if (org == "Org2") {
        walletPath = path.join(process.cwd(), 'org2-wallet');
    } else
        return null;
    console.log(walletPath);
    return walletPath;
}

const getCaInfo = async (org, ccp) => {
    let caInfo
    if (org == "Org1") {
        caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    } else if (org == "Org2") {
        caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
    } else
        return null
    return caInfo;
}

const enrollAdmin = async (org, ccp) => {
    try {
        const caInfo = await getCaInfo(org, ccp);
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        const walletPath = await getWalletPath(org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        let x509Identity;
        if (org == "Org1") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
        } else if (org == "Org2") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org2MSP',
                type: 'X.509',
            };
        }

        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return;
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
};

const getAffiliation = async (org) => {
    return org == 'Org1' ? 'org1.department1' : 'org2.department1'
}

const registerUser = async (userorg, username, password) => {
    let ccp = await getCCP(userorg);
    const caURL = await getCaUrl(userorg, ccp);
    const ca = new FabricCAServices(caURL);
    const walletPath = await getWalletPath(userorg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        return {
            success: true,
            message: username + ' already enrolled',
            status: 209,
        };
    } else {
        try {
            let adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                await enrollAdmin(userorg, ccp);
                adminIdentity = await wallet.get('admin');
                console.log("Admin Enrolled Successfully");
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');
            let secret;
            try {
                secret = await ca.register({ affiliation: await getAffiliation(userorg), enrollmentID: username, role: 'client' }, adminUser);
            } catch (error) {
                return error.message;
            }

            const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });

            let x509Identity;
            if (userorg == "Org1") {
                x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: 'Org1MSP',
                    type: 'X.509',
                };
            } else if (userorg == "Org2") {
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

            const connectOptions = {
                wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            };

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork('mychannel');

            const contract = network.getContract('user');

            let result = await contract.submitTransaction('createUser', username, username, password, userorg);
            let message = `Successfully added the user asset with key ${username}`;

            await gateway.disconnect();

            console.log(`Successfully added the user asset with key ${username} to the ledger`);

            let response = {
                message: message,
                result: result,
                status: 200,
            };
            return response;
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return error.message;
        }
    }
};

module.exports = {
    getCCP: getCCP,
    getCaUrl: getCaUrl,
    getWalletPath: getWalletPath,
    getCaInfo: getCaInfo,
    enrollAdmin: enrollAdmin,
    getAffiliation: getAffiliation,
    registerUser: registerUser,
}