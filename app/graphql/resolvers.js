var KotoEventModel = require('../models/kotoEventModel');
var KotoNotifyModel = require('../models/kotoNotifyModel');
const constants = require('../utils/const')
const Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var logger = require('../utils/logger.js');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');


exports.resolvers = {
    Query: {
        eventBundles(root, args, context) {
            return KotoEventModel.find().sort({ date: constants.DESC_SORT_ORDER }).exec()
        },
        notification(root, args, context){
            try {
                return verifyGQLTokenPromise(context.apiToken).then(() => KotoNotifyModel.find().sort({ messageArriveDateTime: constants.DESC_SORT_ORDER }).exec())
            } catch (err) {
                return err

            }
        }
    }
}

const verifyGQLTokenPromise = function (apiToken) {
    return new Promise(function (resolve, reject) {
        if (apiToken === undefined) {
            reject()
        } else {
            console.log(apiToken)
            resolve([{ messageSubject: 'fake2' }])
        }
    })
}

const verifyGQLToken = function (apiToken) {
    logger.log(req, 'verifyToken.jwtIn:' + apiToken)
    if (apiToken === undefined) {
        throw new Error("Missing or incomplete authentication parameters")
    } else {
        jwt.verify(apiToken, kotiConfig.api_key, function (err, decoded) {
            if (decoded) {
                const now = new Date().getTime() / 1000;
                if (now > apiToken.exp) {
                    logger.log(req, 'Expired token for USER:' + decoded.user + ' ROLE:' + decoded.role)
                    throw new Error("Authentication parameters expired!")
                } else {
                    logger.log(req, 'Valid token for USER:' + decoded.user + ' ROLE:' + decoded.role)
                    tokenVerifiedCallback(decoded)
                }
            } else {
                logger.err(req, 'verifyToken.verify failed:' + err)
                if (err && err.name === 'TokenExpiredError') {
                    throw new Error("Authentication parameters expired!")
                } else {
                    throw new Error("Missing permissions!")
                }
            }
        });
    }
}