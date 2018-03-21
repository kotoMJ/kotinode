const kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
const logger = require('../utils/logger.js');
const KotiHeatingSchedule = require('../models/kotiHeatingSchedule');
const KotiHeatingSchema = require('../models/kotiHeatingStatus');
const apiKeyUtils = require('./kotoAuthController');
const moment = require('moment');
const sslCertificate = require('get-ssl-certificate');

exports.saveHeatingStatus = function (req, res) {
    apiKeyUtils.verifyHeatingKey(req, res, () => {
        const heatingId = req.params.heating_id;
        const heatingName = req.body.deviceName;
        const heatingDateTimeValue = req.body.deviceDateTime;
        const heatingModeValue = req.body.deviceMode;
        const temperatureValue = req.body.temperature;
        const timetableValue = req.body.timetable;

        if (temperatureValue === undefined) {
            logger.log(req, 'Missing t parameter');
            return res.status(401).json({"message": "Missing t parameter"})
        }

        //[hour:18][minute:25][day:MO]
        var matches = heatingDateTimeValue.match(/\[hour:(.*?)\]\[minute:(.*?)\]\[day:(.*?)\]/);

        var hourValue = matches[1];
        var minuteValue = matches[2];
        var dayValue = matches[3];

        var newHeatingStatus =
            {
                heatingId: heatingId,
                heatingName: heatingName,
                hour: hourValue,
                minute: minuteValue,
                day: dayValue,
                heatingMode: heatingModeValue,
                temperature: temperatureValue,
                timestamp: new Date(),
                timetable: timetableValue
            };
        KotiHeatingSchema.findOneAndUpdate({heatingId: heatingId}, newHeatingStatus,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, 'incoming body:' + JSON.stringify(req.body));
                    logger.log(req, "error when saving model:");
                    res.send(err)
                }
                else
                    res.status(200).jsonWrapped(updateResult)
            })
    })
};

exports.getHeatingStatus = function (req, res) {
    logger.log(req, "getHeatingStatus")
    apiKeyUtils.verifyUserHeatingKey(req, res, () => {
        const heatingId = parseInt(req.params.heating_id);
        KotiHeatingSchema.find().where('heatingId').equals(heatingId).exec(function (err, findResult) {
            if (err) {
                res.status(500).send(err)
            } else {
                logger.log(req, findResult)
                res.jsonWrapped(findResult);
            }
        });
    })
}

//hexString = yourNumber.toString(16);
//yourNumber = parseInt(hexString, 16);

exports.setHeatingSchedule = function (req, res) {
    logger.log(req, "setHeatingSchedule")
    apiKeyUtils.verifyHeatingKey(req, res, () => {
        logger.log(req, 'incoming body:' + JSON.stringify(req.body));
        const timetable = req.body.timetable;
        const heatingId = req.params.heating_id;
        //const validity = req.body.validity;
        let newHeatingSchedule =
            {
                heatingId: heatingId,
                timetable: timetable,
                validity: Date()
                //validity: moment(validity, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate()//2018-01-22T06:52:49.000Z
            };

        KotiHeatingSchedule.findOneAndUpdate({heatingId: heatingId}, newHeatingSchedule,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, "error when saving model:");
                    logger.log(req, JSON.stringify(newHeatingSchedule));
                    res.send(err)
                }
                else
                    res.status(200).jsonWrapped(updateResult)
            })
    })
}

exports.getHeatingScheduleRaw = function (req, res) {
    const heatingId = req.params.heating_id;
    KotiHeatingSchedule.findOne().where('heatingId').equals(heatingId).exec(function (err, schema) {
        if (err) {
            return res.status(500).send(err)
        } else {
            // logger.log(req, 'loaded schema:' + JSON.stringify(schema));
            let weekString = "";
            if (schema.timetable !== undefined) {
                for (let day = 0; day < 7; day++) {
                    let dayString = "";
                    // logger.log(req, 'schema.timetable.length:' + schema.timetable.length);
                    if (schema.timetable.length === 7) {
                        // logger.log(req, '[day]:' + JSON.stringify(day));
                        // logger.log(req, 'schema.timetable[day]:' + JSON.stringify(schema.timetable[day]));
                        if (schema.timetable[day].length === 24) {
                            for (let hour = 0; hour < 24; hour++) {
                                // logger.log(req, '[hour]:' + JSON.stringify(hour));
                                // logger.log(req, 'schema.timetable[day][hour]:' + JSON.stringify(schema.timetable[day][hour]));
                                dayString = dayString + schema.timetable[day][hour];
                                dayString = dayString + " "
                            }
                        }
                    }
                    weekString = weekString + dayString
                }
            } else {
                logger.log(req, 'no timetable!');
            }

            return res.status(200).send(weekString);
        }
    });

    // let su = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let mo = new Array('150 150 150 150 150 150 150 230 230 230 230 230 230 230 230 230 230 230 230 230 200 150 150 150 ');
    // let tu = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let we = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let th = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let fr = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let sa = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');

    //return res.status(200).send(/*su + mo + tu + we + th + fr + sa*/);
}

exports.getHeatingSchedule = function (req, res) {
    logger.log(req, "getHeatingSchedule")
    apiKeyUtils.verifyUserHeatingKey(req, res, () => {
        const heatingId = req.params.heating_id;
        KotiHeatingSchedule.findOne().where('heatingId').equals(heatingId).exec(function (err, schema) {
            if (err) {
                return res.status(500).send(err)
            } else {
                logger.log(req, 'loaded schema:' + JSON.stringify(schema));
                let weekString = "";
                if (schema !== null && schema.timetable !== undefined) {
                    return res.status(200).json({
                        "dataValue": {
                            "schedule": schema.timetable
                        }
                    })
                } else {
                    logger.log(req, 'no schema or timetable for heatingId=' + heatingId);
                }

                return res.status(204).send(weekString);
            }
        });
    });

    // return res.status(200).json({
    //         "dataValue": {
    //             "schedule":
    //                 [
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // NE
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "230", "230", "230", "230", "230", "230", "150", "150", "150", "150"], // PO
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // UT
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // ST
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // CT
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // PA
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"] // SO
    //                 ]
    //         }
    //     }
    // )
}

exports.getCert = function (req, res) {
    sslCertificate.get('kotopeky.cz').then(function (certificate) {
        return res.status(200).send(certificate.fingerprint.replace(/:/g, " "))
    })

}

exports.cleanupHeatingData = function (req, res) {
    apiKeyUtils.verifyUserAdminKey(req, res, () => {
        logger.log(req, "Ready to drop schedule model...");
        KotiHeatingSchedule.remove({}, function (err, result) {
            if (err == null) {
                logger.log(req, 'Schedule model cleaned!');
                logger.log(req, "Ready to drop schema model...");
                KotiHeatingSchema.remove({}, function (err, result) {
                    if (err == null) {
                        logger.log(req, 'Schema model cleaned!');
                        logger.log(req, "Drop done...");
                        return res.status(200).json({
                            "message": "drop done"
                        })
                    } else {
                        logger.log(req, 'Schema model clean failed!' + err);
                        return res.status(500).json({
                            "message": "schema drop failed"
                        })
                    }
                });
            } else {
                logger.log(req, 'Schedule model clean failed!' + err);
                return res.status(500).json({
                    "message": "schedule drop failed"
                })
            }
        });


    });
}
