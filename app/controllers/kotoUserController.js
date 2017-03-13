var fs = require('fs');
var jwt = require('jsonwebtoken');
var logger = require('../utils/logger.js');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var KotoUserModel = require('../models/kotoUserModel');

const DESC_SORT_ORDER = -1
const ASC_SORT_ORDER = 1

function verifyToken(req, res) {
    var apiKey = req.headers['apikey'];
    if (apiKey === undefined) {
        res.status(401).json({"message": "Missing or incomplete authentication parameters"})
        return false
    } else if (kotiConfig.api_key !== apiKey) {
        res.status(403).json({"message": "Missing permissions!"})
        return false
    } else
        return true

}

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
            'apiKey': kotiConfig.api_key
        };
        var jwtToken = jwt.sign(profile, kotiConfig.api_key, {'expiresIn': 20 * 60});  // expires in 1200 sec (20 min)
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

// Alerts all clients via socket io.
function alertClients(type, msg) {
    console.log("SocketIO alerting clients: ", msg);
    koTio.sockets.emit('alert', {message: msg, time: new Date(), type});
}

exports.getUserList = function (req, res) {
    logger.log(req, 'getUserList');
    const delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);

    setTimeout(function () {
        KotoUserModel.find().sort({date: DESC_SORT_ORDER}).exec(function (err, userList) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).jsonWrapped(userList);
            }
        });
    }, delay);// delay to simulate slow connection!
};

exports.getUserById = function (req, res) {
    const id = req.params.user_id;
    const delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);
    logger.log(req, 'getUserById:' + id);
    setTimeout(function () {
        KotoUserModel.find().where('_id').equals(id).exec(function (err, userList) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).jsonWrapped(userList);
            }
        });
    }, delay);// delay to simulate slow connection!
};

/**
 * Get unique list of all tags (collected over all users).
 * @param req
 * @param res
 */
exports.getAllTags = function (req, res) {
    logger.log(req, "tagging a...");
    KotoUserModel.find().exec(function (err, userList) {
        if (err) {
            res.status(500).send(err)
        } else {
            logger.log(req, "tagging b...");
            let tagList = []
            for (var index in userList) {
                tagList = tagList.concat(userList[index].tagList)
            }
            logger.log(req, "list:" + tagList);
            res.status(200).jsonWrapped(Array.from(new Set(tagList)));
        }
    });
}

exports.deleteUserById = function (req, res) {
    if (verifyToken(req, res)) {
        KotoUserModel.remove({
            _id: req.params.user_id
        }, function (err, deletedUser) {
            if (err)
                res.status(500).send(err);

            res.status(200).json({message: 'KotoUser ' + deletedUser + ' deleted'});
        });
    }
};


exports.deleteUsers = function (req, res) {
    if (verifyToken(req, res)) {
        KotoUserModel.remove({}, function (err) {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).json({message: 'All KotoUser deleted'});
        });
    }
};

exports.createUser = function (req, res) {
    if (verifyToken(req, res)) {
        logger.log(req, JSON.stringify(req.body));
        const payload = JSON.parse(JSON.stringify(req.body));
        const kotoUser = new KotoUserModel(payload);

        kotoUser.save(function (err, result) {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).json({message: 'KotoUser created: ' + result._id});
        });
    }
};

exports.replaceUserById = function (req, res) {
    if (verifyToken(req, res)) {
        const id = req.params.user_id;
        const payload = JSON.parse(JSON.stringify(req.body));

        KotoUserModel.update({_id: id}, payload, {runValidators: true}, function (err, result) {
            if (err)
                res.status(500).send(err);
            else {
                logger.log(req, JSON.stringify(result))
                res.status(200).json({ message: 'KotoUser updated: ' + id });
            }
        });

        // mongoose.Promise = require('q').Promise;
        //
        // var promise = KotoUserModel.update({_id:id}, payload, {runValidators:true }).exec();
        // promise.then(function(user){
        //     res.status(200).json({message: 'KotoUser updated: ' + user._id});
        // }).then(function (user) {
        //     logger.log('KotoUser updated: ' + id)
        // }).catch(function (err) {
        //     logger.err('KotoUser update failed for id: ' + id)
        //     res.status(500).send(err);
        // })
    }
};
