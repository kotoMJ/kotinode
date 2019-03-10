var fs = require('fs');
var logger = require('../utils/logger.js');
var jwt = require('jsonwebtoken');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
const Promise = require('bluebird');


// ----------------------------------------------------
// CRUD FOR LIST of CLASS
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseClassFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.class.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// ----------------------------------------------------
// CRUD FOR LIST of STUDENT
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseStudentFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.student.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};
// ----------------------------------------------------
// CRUD FOR LIST of TEACHER
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseTeacherFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.teacher.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// ----------------------------------------------------
// SIMPLE AUTHORIZATION for security showcase
// http://url:port/api/securityshowcase/login
// ----------------------------------------------------

exports.simpleLogin = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if ((username === undefined) || (password === undefined)) {
        res.status(401).json({"message": "Missing or incomplete authorization parameters"})
    }
    if ((username === "SecurityShowcaseUser") && (password === "passW0rd1234")) {
        res.status(200).json({
            "dataValue": {
                "username": username,
                "userId": "1",
                "token": "JC3bj7vZNh12A4X+kHieMRVublL0bI89EWQucVvgZomrQyq3ri6MUZhFDZCwdPMhyBRtJstBkYPi6MPV8gXwEaq2WIBkiYSKRjWouRsRCClFjKBWRZgP4NZMmNv7I3cJel6IAmOZ95JKHXzpyyfOGNPXibIb+HrTtVwZRQOVqXNWlDilKpf/UHsN+Xy1rkIlmmBWQ3dLlN9sSE2L8JLTbbEETc2T25Pt+D7FJ/hFVeo3yHJkhpRMZvSI3aGYtMegNgbynwPbEga136pdqu9lfmGTlS1mjNwOz+jZ+nxs7KTWEXBs8xEJ9KExW0Riee7zElwABfe8r9Qsqk49WbnZ/gjnGs+g2FLdIYElA7rUNVR9l/u9XTFNg5cNEKur1BPC",
                "successful": true,
            }
        })
    } else {
        res.status(403).json({
            "dataValue": {
                "username": username,
                "userId": "1",
                "token": "",
                "successful": false,
                "message": "Username or password invalid."
            }
        })
    }

};

exports.showcaseUser = function (req, res) {
    try {
        if (req.headers.authorization === undefined || req.headers.authorization === null) {
            res.status(401).json({'message': 'missing jwt header'});
        }
        const token = req.headers.authorization.split(" ")[1]
        logger.log(req, 'token='+token)
        jwt.verify(token, kotiConfig.api_key, function (err, payload) {
            console.log(payload)
            if (payload) {
                res.status(200).json({
                    "dataValue": {
                        "name": "michal",
                        "surname": "jenicek"
                    }
                })

            } else {
                logger.err(req, err)
                res.status(401).json({'message': 'invalid jwt'});
            }
        })
    } catch (e) {
        logger.err(req, e)
        res.status(500).json({'message': 'unexpected error'});
    }
}

// ----------------------------------------------------
// KOTINODE JWT AUTHORIZATION
// http://url:port/api/kotinode/login
// ----------------------------------------------------

exports.jwtLogin = function (req, res) {
    try {
        const credentials = req.body;
        logger.log(req, "postKotoLogin");
        logger.log(req, JSON.stringify(kotiConfig.userList));

        if (credentials.password === undefined || credentials.email === undefined) {
            res.status(400).json({'message': 'Missing user or password'});
        } else {

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
        }
    } catch (e) {
        logger.err(req, e)
        res.status(500).json({'message': 'unexpected error'});
    }
};

// Alerts all clients via socket io.
function alertClients(type, msg) {
    console.log("SocketIO alerting clients: ", msg);
    koTio.sockets.emit('alert', {message: msg, time: new Date(), type});
}

exports.preflight = function (req, res) {
    logger.log(req, 'Preflight...');
    res.status(200).json({});
}

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