var logger = require('../utils/logger.js');
var apiKeyUtils = require('../utils/apiKeyUtils')
var notifyUtils = require('../utils/notifyUtils')
var kotoUserController = require('../controllers/kotoUserController')
var KotoNotifyModel = require('../models/kotoNotifyModel');
var constants = require('../utils/const')

/**
 * @param req
 * @param res
 */
exports.notifyEmail = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, "exports.notifyEmail");
        var payload = req.body
        if (payload.to !== undefined
            && payload.subject !== undefined
            && (payload.text !== undefined /*|| payload.html!==undefined*/)) {

            notifyUtils.notifyEmail(payload.to, payload.subject, payload.text,
                (successMessage) => {
                    res.status(200).json({ "message": successMessage });
                },
                (errorMessage) => {
                    res.status(500).json({ "message": errorMessage });
                })

        } else {
            res.status(401).json({ "message": "Missing or incomplete message parameters in body!" })
        }
    }
};

/**
 * @param req
 * @param res
 */
exports.notifySms = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, "exports.notifySms");
        var payload = req.body
        if (payload.number !== undefined
            && payload.message !== undefined) {
            logger.log(req, 'Getting send the message:' + payload.message);
            var gateway = (payload.urgent === undefined || payload.urgent === false || payload.urgent === 'false') ? 'lowcost' : 'high';
            notifyUtils.notifySms(payload.number, payload.message, gateway,
                (smsResponse) => {
                    logger.log(req, smsResponse.body)
                    res.status(200).json({ "message": smsResponse.body, "gateway": gateway });
                }, (smsResponse) => {
                    logger.err(req, smsResponse.body)
                    res.status(500).json({ "message": smsResponse.body });
                })
        }
        else {
            res.status(401).json({ "message": "Missing or incomplete message parameters in body!" })
        }
    }
};


exports.notify = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        try {
            logger.log(req, "exports.notify");
            logger.log(req, JSON.stringify(req.body))
            const payload = req.body
            //payload.date = moment(payload.date, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
            if (payload === undefined) {
                throw new Error('Missing payload in body!');
            } else {
                let kotoNotify = new KotoNotifyModel(payload);
                kotoNotify.messageArriveDateTime = new Date()
                kotoNotify.sender = 'N/A'//req.headers['apikey']
                if (payload.tagList === undefined) throw Error('Missing tagList parameter!')
                if (payload.notificationType === undefined) throw Error('Missing notificationType parameter!')
                if (payload.messageSubject === undefined) throw Error('Missing messageSubject parameter!')
                if (payload.messageBody === undefined) throw Error('Missing messageBody parameter!')

                var gateway = (payload.urgent === undefined || payload.urgent === false || payload.urgent === 'false') ? 'lowcost' : 'high';
                kotoUserController.getInternalUserListByTag(payload.tagList, (userList) => {
                    const userListSize = userList.length
                    const notificationTypeRange = payload.notificationType.length
                    let notificationSentGroup = 0
                    userList.forEach(function (user, index) {
                        logger.log(req, "USER:" + JSON.stringify(user))
                        logger.log(req, "INDEX:" + index)
                        //logger.log(req, JSON.stringify(kotoNotify))

                        /**
                         *  SMS
                         */
                        if (payload.notificationType.indexOf("sms") > -1) {
                            notifyUtils.notifySms('' + user.phone[0].countryCode + user.phone[0].value,
                                payload.messageSubject + ' ' + payload.messageBody, gateway,
                                () => {
                                    if ((index + 1) === userListSize) { //check sms for last user
                                        notificationSentGroup = notificationSentGroup + 1
                                        if (notificationTypeRange == notificationSentGroup) {//check if other groups (email) is done
                                            kotoNotify.messageProcessDateTime = new Date()
                                            kotoNotify.save(function (err, result) {
                                                if (err)
                                                    throw Error(`Unable to save ${JSON.stringify(kotoNotify)}`)
                                                else {
                                                    logger.log(req, "sms userListSize:" + userListSize)
                                                    res.status(200).json({ "message": `${userListSize} users notified via: ${kotoNotify.notificationType} ` })
                                                }
                                            })
                                        }
                                    }
                                },
                                () => {
                                    throw Error(`Unable to save ${JSON.stringify(kotoNotify)}`)
                                })
                        }

                        /**
                         *  EMAIL
                         */
                        if (payload.notificationType.indexOf("email") > -1) {
                            notifyUtils.notifyEmail('' + user.email[0].value,
                                payload.messageSubject, payload.messageBody,
                                () => {
                                    if ((index + 1) === userListSize) {//check sms for last user
                                        notificationSentGroup = notificationSentGroup + 1
                                        if (notificationTypeRange == notificationSentGroup) {//check if other groups (email) is done
                                            kotoNotify.messageProcessDateTime = new Date()
                                            kotoNotify.save(function (err, result) {
                                                logger.log(req, "email userListSize:" + userListSize)
                                                if (err)
                                                    throw Error(`Unable to save ${JSON.stringify(kotoNotify)}`)
                                                else {
                                                    res.status(200).json({ "message": `${userListSize} users notified via: ${kotoNotify.notificationType} ` })
                                                }
                                            })
                                        }

                                    }
                                },
                                () => {
                                    throw Error(`Unable to save ${JSON.stringify(kotoNotify)}`)
                                }
                            )
                        }

                    });
                })
            }
        } catch (payloadException) {
            if (payloadException.message === undefined) {
                res.status(500).json({ "message": payloadException })
            } else {
                res.status(403).json({ "message": payloadException.message })
            }
        }
    }
}

exports.getNotificationList = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, 'getUserList');
        const delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);
        setTimeout(function () {
            KotoNotifyModel.find().sort({ date: constants.DESC_SORT_ORDER }).exec(function (err, notificationList) {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.status(200).jsonWrapped(notificationList);
                }
            });
        }, delay);// delay to simulate slow connection!
    }
};


exports.getSmsCredit = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, 'getUserList');
        setTimeout(function () {
            notifyUtils.checkSmsStatus((responseBody) => {
                    if (responseBody.indexOf("|") > -1) {
                        res.status(200).jsonWrapped(responseBody.split("|")[0])
                    } else {
                        logger.err(req, 'SMS-STATUS:' + responseBody)
                        res.status(200).jsonWrapped("N/A")
                    }
                },
                (err) => {
                    res.status(500).send(err)
                })
        }, 0);
    }
};