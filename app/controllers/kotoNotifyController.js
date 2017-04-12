var logger = require('../utils/logger.js');
var apiKeyUtils = require('../controllers/kotoAuthController')
var notifyUtils = require('../utils/notifyUtils')
var kotoUserController = require('../controllers/kotoUserController')
var KotoNotifyModel = require('../models/kotoNotifyModel');
var constants = require('../utils/const')

exports.notify = function (req, res) {
    apiKeyUtils.verifyToken(req, res, (tokenPayload) => {
        const transporter = notifyUtils.getEmailTransport()
        try {
            logger.log(req, 'tokenPayload:' + tokenPayload)
            logger.log(req, "exports.notify");
            logger.log(req, JSON.stringify(req.body))
            const payload = req.body
            //payload.date = moment(payload.date, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
            if (payload === undefined) {
                throw new Error('Missing payload in body!');
            } else {
                let kotoNotify = new KotoNotifyModel(payload);
                kotoNotify.messageArriveDateTime = new Date()
                kotoNotify.sender = 'N/A'
                if (tokenPayload) {
                    kotoNotify.sender = tokenPayload.user
                }
                if (payload.tagList === undefined) throw Error('Missing tagList parameter!')
                if (payload.notificationType === undefined) throw Error('Missing notificationType parameter!')
                if (payload.messageSubject === undefined) throw Error('Missing messageSubject parameter!')
                if (payload.messageBody === undefined) throw Error('Missing messageBody parameter!')

                kotoUserController.getInternalUserListByTag(payload.tagList, (userList) => {
                    const userListSize = userList.length
                    const notificationTypeRange = payload.notificationType.length
                    let notificationSentGroup = 0

                    /**
                     * SMS
                     */
                    notifyUserList(req, payload, transporter, userList, 0, () => {
                        notifySuccess(req, res, kotoNotify)
                    })

                });
            }
            transporter.close()
        } catch (payloadException) {
            transporter.close()
            if (payloadException.message === undefined) {
                res.status(500).json({ "message": payloadException })
            } else {
                res.status(403).json({ "message": payloadException.message })
            }
        }
    })
}

var notifyUserList = function (req, payload, transporter, userList, index, successCalback) {
    logger.log(req, 'notifyUserList.started')
    logger.log(req, 'index' + index + ' ,userList.length' + userList.length)
    if (index < userList.length) {
        notifyOneUser(req, payload, transporter, userList[index], () => {
            logger.log(req, 'notifyUserList.recursive...')
            notifyUserList(req, payload, transporter, userList, index + 1, successCalback)
        })
    } else {
        logger.log(req, 'notifyUserList.finalize')
        successCalback()
    }

}
notifyOneUser = function (req, payload, transporter, user, successCallback) {
    if (payload.notificationType.indexOf("sms") > -1) {
        notifyUtils.notifySmsUserOne(req, payload, user, () => {
            if (payload.notificationType.indexOf("email") > -1) {
                notifyUtils.notifyEmailUserOne(req, payload, transporter, user, () => {
                    logger.log(req, 'notifyOneUser.success')
                    successCallback()
                })
            } else {
                successCallback()
            }
        })
    } else if (payload.notificationType.indexOf("email") > -1) {
        notifyUtils.notifyEmailUserOne(req, payload, transporter, user, () => {
            successCallback()
        })
    }
}

notifySuccess = function (req, res, kotoNotify) {
    kotoNotify.messageProcessDateTime = new Date()
    logger.log(req, 'success email callback.c... saving.')
    kotoNotify.save(function (err, result) {
        if (err) {
            logger.log(req, error)
            throw Error('Unable to save [email]:' + JSON.stringify(kotoNotify))
        }
        else {
            res.status(200).json({ "message": `Notification finished for type > ${kotoNotify.notificationType}` })
        }
    })
}

exports.getNotificationList = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        logger.log(req, 'getUserList');
        const delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);
        setTimeout(function () {
            KotoNotifyModel.find().sort({ messageArriveDateTime: constants.DESC_SORT_ORDER }).exec(function (err, notificationList) {
                if (err) {
                    res.status(500).send(err)
                } else {
                    notifyUtils.checkSmsStatus((responseBody) => {
                            if (responseBody.indexOf("|") > -1) {
                                logger.log(req, 'SMS-STATUS:' + responseBody + 'notifList:' + notificationList)
                                res.status(200).jsonWrapped({
                                    "notifList": notificationList,
                                    "smsCredit": responseBody.split("|")[0]
                                });
                            } else {
                                logger.err(req, 'SMS-STATUS:' + responseBody)
                                res.status(200).jsonWrapped({
                                    "notifList": notificationList,
                                    "smsCredit": "N/A"
                                });
                            }
                        },
                        (err) => {
                            logger.err(req, 'SMS-STATUS:' + err)
                            res.status(200).jsonWrapped({
                                "notifList": notificationList,
                                "smsCredit": "N/A"
                            });
                        })

                }
            });
        }, delay);// delay to simulate slow connection!
    })
};


exports.getSmsCredit = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        logger.log(req, 'getSmsCredit');
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
    })
}


exports.deleteNotify = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        KotoNotifyModel.remove({}, function (err) {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).json({ message: 'All KotoNotify deleted' });
        })
    })
};