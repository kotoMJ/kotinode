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
                return verifyGQLTokenPromise(context.requestId, context.apiToken)
                    .then(() => KotoNotifyModel.find().sort({ messageArriveDateTime: constants.DESC_SORT_ORDER }).exec())
            } catch (err) {
                return err

            }
        }
    }
}

const verifyGQLTokenPromise = function (requestId, apiToken) {
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