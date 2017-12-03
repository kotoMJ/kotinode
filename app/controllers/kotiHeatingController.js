var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var logger = require('../utils/logger.js');
var KotiHeatingModel = require('../models/kotiHeatingModel');

exports.saveHeatingStatus = function (req, res) {
    var temperatureValue = req.body.temperature;
    var timetableValue = req.body.timetable;
    var keyBody = req.body.key;
    var keyHeader = req.headers['key'];
    var deviceDateTimeValue = req.body.deviceDateTime;
    var deviceModeValue = req.body.deviceMode

    if (temperatureValue === undefined) {
        logger.log(req, 'Missing t parameter');
        return res.status(401).json({"message": "Missing t parameter"})
    }
    if ((keyBody === undefined) && (keyHeader === undefined)) {
        logger.log(req, 'Missing k parameter');
        return res.status(401).json({"message": "Missing k parameter"})
    }

    if ((keyBody === kotiConfig.heatingKey) || ( keyHeader === kotiConfig.heatingKey)) {

        //[hour:18][minute:25][day:MO]
        var matches = deviceDateTimeValue.match(/\[hour:(.*?)\]\[minute:(.*?)\]\[day:(.*?)\]/);

        var hourValue = matches[1];
        var minuteValue = matches[2];
        var dayValue = matches[3];

        var newHeatingModel =
            {
                uniqueModelId: 0,
                heatingDeviceStatus: {
                    hour: hourValue,
                    minute: minuteValue,
                    day: dayValue,
                    deviceMode: deviceModeValue,
                    temperature: temperatureValue,
                    timestamp: new Date(),
                    timetable: timetableValue
                }
            };
        KotiHeatingModel.findOneAndUpdate({uniqueModelId: 0}, newHeatingModel,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, 'incoming body:' + JSON.stringify(req.body));
                    logger.log(req, "error when saving model:");
                    logger.log(req, newHeatingModel);
                    res.send(err)
                }
                else
                    res.status(200).jsonWrapped(updateResult)
            })
    } else {
        logger.log(req, 'Invalid credentials');
        return res.status(403).json({
            "dataValue": "invalid credentials"
        })
    }
};

exports.getHeatingStatus = function (req, res) {
    logger.log(req, "getHeatingStatus")
    KotiHeatingModel.find().where('uniqueModelId').equals(0).exec(function (err, findResult) {
        if (err) {
            res.status(500).send(err)
        } else {
            logger.log(req, findResult)
            res.jsonWrapped(findResult);
        }
    });
}

//hexString = yourNumber.toString(16);
//yourNumber = parseInt(hexString, 16);

exports.getHeatingScheduleRaw = function (req, res) {


    let su = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    let mo = new Array('150 150 150 150 150 150 150 230 230 230 230 230 230 230 230 230 230 230 230 230 200 150 150 150 ');
    let tu = new Array('150 150 150 150 180 200 210 220 220 230 230 230 200 150 150 150 150 150 150 150 150 150 150 150 ');
    let we = new Array('150 150 150 150 150 150 150 180 200 210 220 230 230 230 230 230 200 180 150 150 150 150 150 150 ');
    let th = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    let fr = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    let sa = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');


    //TODO read from DB
    return res.status(200).send(su + mo + tu + we + th + fr + sa);
}

exports.getHeatingSchedule = function (req, res) {

    //TODO read from DB
    return res.status(200).json({
            "dataValue": {
                "schedule":
                    [
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // NE
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "230", "230", "230", "230", "230", "230", "150", "150", "150", "150"], // PO
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // UT
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // ST
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // CT
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // PA
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"] // SO
                    ]
            }
        }
    )
}