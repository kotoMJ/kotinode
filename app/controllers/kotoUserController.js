var fs = require('fs');
var jwt = require('jsonwebtoken');
var logger = require('../utils/logger.js');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');

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
    const userList = JSON.parse(JSON.stringify(kotiConfig.userList));
    let currentUser = null;
    for (var i in userList) {
        logger.log(req, JSON.stringify(userList[i]));
        if (userList[i].email === credentials.user) {
            currentUser = userList[i];
            break;
        }
    }

    if (currentUser !== null && credentials.password === currentUser.password) {
        logger.log(req, "in...");
        // Once authenticated, the user profiles is signed and the jwt token is returned as response to the client.
        // It's expected the jwt token will be included in the subsequent client requests.
        const profile = {'user': currentUser.email, 'role': currentUser.role, 'apiKey': kotiConfig.api_key};
        const jwtToken = jwt.sign(profile, kotiConfig.api_key, {'expiresIn': 20 * 60});  // expires in 1200 sec (20 min)
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

// Alerts all clents via socket io.
function alertClients(type, msg) {
    console.log("SocketIO alerting clients: ", msg);
    koTio.sockets.emit('alert', {message: msg, time: new Date(), type});
}