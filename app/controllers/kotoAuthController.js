var jwt = require('jsonwebtoken');
var logger = require('../utils/logger.js');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
const Promise = require('bluebird');
const {OAuth2Client} = require('google-auth-library');

exports.preflight = function (req, res) {
    logger.log(req, 'Preflight...');
    res.status(200).json({});
}
// ----------------------------------------------------
// KOTINODE JWT AUTHORIZATION
// http://url:port/api/kotinode/login
// ----------------------------------------------------

exports.postKotoLogin = function (req, res) {
    const credentials = req.body;
    logger.log(req, "postKotoLogin");
    logger.log(req, JSON.stringify(kotiConfig.userList));
    var userList = JSON.parse(JSON.stringify(kotiConfig.userList));
    var currentUser = null;
    for (var i in userList) {
        logger.log(req, JSON.stringify(userList[i]));
        if (userList[i].email === credentials.email) {
            currentUser = userList[i];
            break;
        }
    }

    if (currentUser !== null && credentials.password === currentUser.password) {
        logger.log(req, "in...");
        // Once authenticated, the user profiles is signed and the jwt token is returned as response to the client.
        // It's expected the jwt token will be included in the subsequent client requests.
        var profile = {
            'user': currentUser.email,
            'role': currentUser.role,
        };
        var jwtToken = jwt.sign(profile, kotiConfig.api_key, {'expiresIn': kotiConfig.api_expire});  // 5*60: 5min
        logger.log(req, 'jwtOut:' + jwtToken)
        res.status(200).json({
            id_token: jwtToken
        });

        alertClients('info', `User '${credentials.user}' just logged in`);
    } else {
        logger.log(req, "bad...");
        res.status(401).json({'message': 'Invalid user/password'});

        alertClients('error', `User '${credentials.user}' just failed to login`);
    }
};

exports.loginGQLPromise = function (requestId, email, password) {
    return new Promise(function (resolve, reject) {
        logger.log(requestId, "postKotoLogin");
        logger.log(requestId, JSON.stringify(kotiConfig.userList));
        var userList = JSON.parse(JSON.stringify(kotiConfig.userList));
        var currentUser = null;
        for (var i in userList) {
            logger.log(requestId, JSON.stringify(userList[i]));
            if (userList[i].email === email) {
                currentUser = userList[i];
                break;
            }
        }

        if (currentUser !== null && password === currentUser.password) {
            logger.log(requestId, "in...");
            // Once authenticated, the user profiles is signed and the jwt token is returned as response to the client.
            // It's expected the jwt token will be included in the subsequent client requests.
            var profile = {
                'user': currentUser.email,
                'role': currentUser.role,
            };
            var jwtToken = jwt.sign(profile, kotiConfig.api_key, {'expiresIn': kotiConfig.api_expire});  // 5*60: 5min
            logger.log(requestId, 'jwtOut:' + jwtToken)
            resolve({
                token: jwtToken
            })
            //alertClients('info', `User '${credentials.user}' just logged in`);
        } else {
            logger.log(requestId, "bad...");
            reject('Invalid user/password');
            //alertClients('error', `User '${credentials.user}' just failed to login`);
        }
    })
};

// Alerts all clients via socket io.
function alertClients(type, msg) {
    console.log("SocketIO alerting clients: ", msg);
    koTio.sockets.emit('alert', {message: msg, time: new Date(), type});
}

exports.verifyHeatingKey = function (req, res, tokenVerifiedCallback) {
    const keyBody = req.body.key;
    const keyHeader = req.headers['key'];

    try {
        if ((keyBody === kotiConfig.heatingKey) || (keyHeader === kotiConfig.heatingKey)) {
            tokenVerifiedCallback()
        } else {
            logger.log(req, 'Invalid credentials');
            return res.status(403).json({
                "dataValue": "invalid credentials"
            })
        }
    } catch (Exception) {
        logger.err(req, Exception)
        res.status(403).json({"message": "Unexpected authentization error!"})
    }
}

exports.verifyToken = function (req, res, tokenVerifiedCallback, allowedRolesArray) {
    try {
        let apiToken = req.headers['apitoken'];
        if (apiToken === undefined) apiToken = req.headers['authorization']
        logger.log(req, 'verifyToken.jwtIn:' + apiToken)
        if (apiToken === undefined) {
            res.status(403).json({"message": "Missing or incomplete authentication parameters"})
        } else {
            jwt.verify(apiToken, kotiConfig.api_key, function (err, decoded) {
                if (decoded) {
                    const now = new Date().getTime() / 1000;
                    if (now > apiToken.exp) {
                        logger.log(req, 'Expired token for USER:' + decoded.user + ' ROLE:' + decoded.role)
                        res.status(401).json({"message": "Authentication parameters expired!"})
                    } else {
                        if (allowedRolesArray === undefined || allowedRolesArray.indexOf(decoded.role) != -1) {
                            logger.log(req, 'Valid token for USER:' + decoded.user + ' ROLE:' + decoded.role)
                            tokenVerifiedCallback(decoded)
                        } else {
                            res.status(403).json({"message": "Missing permissions!"})
                        }
                    }
                } else {
                    logger.err(req, 'verifyToken.verify failed:' + err)
                    if (err && err.name === 'TokenExpiredError') {
                        res.status(401).json({"message": "Authentication parameters expired!"})
                    } else {
                        res.status(403).json({"message": "Missing permissions!"})
                    }
                }
            });
        }
    } catch (Exception) {
        logger.err(req, Exception)
        res.status(403).json({"message": "Unexpected authentization error!"})
    }
}

exports.verifyGQLTokenPromise = function (requestId, apiToken) {
    return new Promise(function (resolve, reject) {
        if (apiToken === undefined) {
            reject("Missing or incomplete authentication parameters")
        } else {
            logger.log(requestId, apiToken)
            jwt.verify(apiToken, kotiConfig.api_key, function (err, decoded) {
                if (decoded) {
                    const now = new Date().getTime() / 1000;
                    if (now > apiToken.exp) {
                        logger.log(requestId, 'Expired token for USER:' + decoded.user + ' ROLE:' + decoded.role)
                        reject("Authentication parameters expired!")
                    } else {
                        logger.log(requestId, 'Valid token for USER:' + decoded.user + ' ROLE:' + decoded.role)
                        resolve(decoded)
                    }
                } else {
                    logger.err(requestId, 'verifyToken.verify failed:' + err)
                    if (err && err.name === 'TokenExpiredError') {
                        reject("Authentication parameters expired!")
                    } else {
                        reject("Missing permissions!")
                    }
                }
            });
        }
    })
}


exports.authorizeUser = function (req, res) {

    logger.log(req, 'body=' + JSON.stringify(req.body))

    const clientId = "950395156002-1emg9edo9g73u6bi1uuiksij6r05ddi6.apps.googleusercontent.com"
    const client = new OAuth2Client(clientId);
    const bodyIdToken = req.body.idToken;

    async function verify() {
        try {
            const ticket = await client.verifyIdToken({
                idToken: bodyIdToken,
                audience: clientId,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            const email = payload['email'];
            const email_verified = payload['email_verified'];
            const webAudience = payload['aud'];//the client ID of the web component of the project
            const androidAudience = payload['azp'];//the client ID of the Android app component of project

            logger.log(req, 'payload=' + JSON.stringify(payload))
            logger.log(req, 'email=' + email + ', email_verified=' + email_verified)

            if (androidAudience === kotiConfig.heatingOAuthClientId) {
                logger.log(req, "audience verified!")

                if (email_verified && email === 'jenicek.michal@gmail.com') {
                    return res.status(200).json({
                        "heatingKey": kotiConfig.heatingKey
                    })
                } else {
                    return res.status(403).json({
                        "message": "invalid audience"
                    })
                }
            } else {
                logger.err(req, "unknown audience!")
                return res.status(403).json({
                    "message": "invalid audience"
                })
            }
        } catch (e) {
            return res.status(403).json({
                "message": "invalid idToken"
            })
        }
    }

    verify().catch(console.error)

}