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
    var userList = JSON.parse(JSON.stringify(kotiConfig.userList));
    var currentUser = null;
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
        var profile = {
            'user': currentUser.email,
            'role': currentUser.role,
        };
        var jwtToken = jwt.sign(profile, kotiConfig.api_key, { 'expiresIn': kotiConfig.api_expire });  // expires in 1200 sec (20 min)
        res.status(200).json({
            id_token: jwtToken
        });

        alertClients('info', `User '${credentials.user}' just logged in`);
    } else {
        logger.log(req, "bad...");
        res.status(401).json({ 'message': 'Invalid user/password' });

        alertClients('error', `User '${credentials.user}' just failed to login`);
    }
};

// Alerts all clients via socket io.
function alertClients(type, msg) {
    console.log("SocketIO alerting clients: ", msg);
    koTio.sockets.emit('alert', { message: msg, time: new Date(), type });
}

exports.verifyToken = function (req, res) {
    try {
        var apiToken = req.headers['apikToken'];
        if (apiToken === undefined) {
            res.status(401).json({ "message": "Missing or incomplete authentication parameters" })
            return false
        } else {
            jwt.verify(token, cert, function (err, decoded) {
                if (decoded) {
                    logger.log(req, 'accessing USER:' + decoded.user + ' ROLE:' + decoded.role)
                    return true
                } else {
                    logger.err(req, 'verify failed:' + err)
                    res.status(403).json({ "message": "Missing permissions!" })
                    return false
                }
            });
        }
    } catch (Exception) {
        logger.err(req, Exception)
        return false
    }
}