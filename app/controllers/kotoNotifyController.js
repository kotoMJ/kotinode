var logger = require('../utils/logger.js');
var apiKeyUtils = require('../utils/apiKeyUtils')
var notifyUtils = require('../utils/notifyUtils')
var KotoNotifyModel = require('../models/kotoNotifyModel');
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
        logger.log(req, "exports.notify");
        logger.log(req, JSON.stringify(req.body))
        try {
            const payload = req.body
            //payload.date = moment(payload.date, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
            if (payload === undefined) {
                throw new Error('Missing payload in body!');
            } else {
                let kotoNotify = new KotoNotifyModel(payload);
                kotoNotify.date = new Date()
            }
        } catch (payloadException) {
            if (payloadException.message === undefined) {
                res.status(500).json({ "message": payloadException })
            } else {
                res.status(401).json({ "message": payloadException.message })
            }
        }
    }
}
