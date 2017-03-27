var logger = require('../utils/logger.js');
var apiKeyUtils = require('./kotoAuthController')
var KotoUserModel = require('../models/kotoUserModel');
var constants = require('../utils/const')

exports.getUserList = function (req, res) {
    logger.log(req, 'getUserList');
    const delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);

    setTimeout(function () {
        KotoUserModel.find().sort({
            'address.municipality': constants.ASC_SORT_ORDER,
            'address.houseNumber': constants.ASC_SORT_ORDER,
        }).exec(function (err, userList) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).jsonWrapped(userList);
            }
        });
    }, delay);// delay to simulate slow connection!
};

exports.getInternalUserListByTag = function (tagListCondition, callback) {
    setTimeout(function () {
        KotoUserModel.find({ tagList: { "$in": tagListCondition } }).sort({ date: constants.DESC_SORT_ORDER }).exec(function (err, userList) {
            if (err) {
                return callback([])
            } else {
                return callback(userList)
            }
        });
    }, 0);
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
            res.status(200).jsonWrapped(Array.from(new Set(tagList)).sort());
        }
    });
}

exports.deleteUserById = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        KotoUserModel.remove({
            _id: req.params.user_id
        }, function (err, deletedUser) {
            if (err)
                res.status(500).send(err);
            res.status(200).json({ message: 'KotoUser ' + deletedUser + ' deleted' });
        })
    })
};


exports.deleteUsers = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        KotoUserModel.remove({}, function (err) {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).json({ message: 'All KotoUser deleted' });
        })
    })
}

exports.createUser = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        logger.log(req, JSON.stringify(req.body));
        const kotoUser = new KotoUserModel(req.body);
        const newEmail = kotoUser.email[0].value
        const newPhone = kotoUser.phone[0].value
        let findArray = []
        if (newEmail) findArray.push({ 'email.value': newEmail })
        if (newPhone) findArray.push({ 'phone.value': newPhone })
        logger.log(req, 'findArray:' + JSON.stringify(findArray))
        if (findArray.length > 0) {
            KotoUserModel.find({ $or: findArray })
                .exec(function (err, userList) {
                    if (err) {
                        logger.err(req, 'save err ' + err)
                        res.status(500).send(err)
                    } else {
                        logger.log(req, 'userList:' + JSON.stringify(userList))
                        if (userList.length) {
                            if (newEmail && userList[0].email[0] && userList[0].email[0].value === newEmail) {
                                res.status(422).send({ message: 'Contact with email ' + kotoUser.email[0].value + ' already exists!' })
                            } else if (newPhone && userList[0].phone[0] && userList[0].phone[0].value === newPhone) {
                                res.status(422).send({ message: 'Contact with phone ' + kotoUser.phone[0].value + ' already exists!' })
                            } else {
                                res.status(422).send({ message: 'Contact already exists!' })
                            }
                        } else {
                            logger.log(req, 'save - doing ...')
                            kotoUser.save(function (err, result) {
                                if (err)
                                    res.status(500).send(err);
                                else
                                    res.status(200).json({ message: 'KotoUser created: ' + result._id });
                            });
                        }
                    }
                });
        } else {
            logger.log(req, 'save (no EMAIL nor PHONE) - doing ...')
            kotoUser.save(function (err, result) {
                if (err)
                    res.status(500).send(err);
                else
                    res.status(200).json({ message: 'KotoUser created: ' + result._id });
            });
        }
    })
};

exports.replaceUserById = function (req, res) {
    apiKeyUtils.verifyToken(req, res, () => {
        const id = req.params.user_id;
        const payload = req.body;
        if (payload.tagList.indexOf(null) != -1) {
            logger.err(req, 'RESET tagList because of null content: ' + JSON.stringify(payload.tagList))
            payload.tagList = ['fixit']
        }
        logger.log(req, 'replaceUserById: ' + JSON.stringify(payload))
        const kotoUser = new KotoUserModel(payload);

        const newEmail = kotoUser.email[0].value
        const newPhone = kotoUser.phone[0].value
        let findArray = []
        if (newEmail) findArray.push({ 'email.value': newEmail })
        if (newPhone) findArray.push({ 'phone.value': newPhone })
        logger.log(req, 'findArray:' + JSON.stringify(findArray))
        if (findArray.length > 0) {
            KotoUserModel.find({ $and: [{ $or: findArray }, { '_id': { $ne: id } }] })
                .exec(function (err, userList) {
                    if (err) {
                        logger.err(req, 'update err ' + err)
                        res.status(500).send(err)
                    } else {
                        logger.log(req, 'userList:' + JSON.stringify(userList))
                        if (userList.length) {
                            if (newEmail && userList[0].email[0] && userList[0].email[0].value === newEmail) {
                                res.status(422).send({ message: 'Contact with email ' + kotoUser.email[0].value + ' already exists!' })
                            } else if (newPhone && userList[0].phone[0] && userList[0].phone[0].value === newPhone) {
                                res.status(422).send({ message: 'Contact with phone ' + kotoUser.phone[0].value + ' already exists!' })
                            } else {
                                res.status(422).send({ message: 'Contact already exists!' })
                            }
                        } else {
                            logger.log(req, 'update - doing ...')
                            KotoUserModel.update({ _id: id }, payload, { runValidators: true }, function (err, result) {
                                if (err)
                                    res.status(500).send(err);
                                else {
                                    logger.log(req, JSON.stringify(result))
                                    res.status(200).json({ message: 'KotoUser updated: ' + id });
                                }
                            });
                        }
                    }
                });
        } else {
            logger.log(req, 'update (no EMAIL nor PHONE) - doing ...')
            KotoUserModel.update({ _id: id }, payload, { runValidators: true }, function (err, result) {
                if (err)
                    res.status(500).send(err);
                else {
                    logger.log(req, JSON.stringify(result))
                    res.status(200).json({ message: 'KotoUser updated: ' + id });
                }
            });
        }
    })
};

