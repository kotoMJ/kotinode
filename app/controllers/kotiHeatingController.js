var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var logger = require('../utils/logger.js');

exports.saveHeatingStatus = function (req, res) {
    logger.log(req, 'body:' + JSON.stringify(req.body));
    var temperature = req.body.temperature;
    var timetable = req.body.timetable;
    var keyBody = req.body.key;
    var keyHeader = req.headers['key'];

    if (temperature === undefined) {
        logger.log(req, 'Missing t parameter');
        return res.status(401).json({"message": "Missing t parameter"})
    }
    if ((keyBody === undefined) && (keyHeader === undefined)) {
        logger.log(req, 'Missing k parameter');
        return res.status(401).json({"message": "Missing k parameter"})
    }

    if ((keyBody === kotiConfig.heatingKey) || ( keyHeader === kotiConfig.heatingKey)) {



        return res.status(200).json({
            "dataValue": {
                "temperature": temperature,
                "keyHeader": keyHeader,
                "keyBody": keyBody
            }
        })
    } else {
        logger.log(req, 'Invalid credentials');
        return res.status(403).json({
            "dataValue": "invalid credentials"
        })
    }
};

exports.getHeatingStatus = function (req, res) {

    //TODO read from DB
    return res.status(200).json({
        "dataValue": {
            "temperature": 19.5
        }
    })
}

//hexString = yourNumber.toString(16);
//yourNumber = parseInt(hexString, 16);

exports.getHeatingScheduleRaw = function (req, res) {


    let su = new Array('110 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 ');
    let mo = new Array('140 140 140 140 140 140 140 220 220 220 220 220 220 220 220 220 220 220 220 220 140 140 140 140 ');
    let tu = new Array('140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 160 160 160 160 140 140 ');
    let we = new Array('140 140 140 140 140 140 140 220 220 220 220 220 220 220 220 220 220 220 220 220 140 140 140 140 ');
    let th = new Array('140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 ');
    let fr = new Array('140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 ');
    let sa = new Array('140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 140 200 ');


    //TODO read from DB
    return res.status(200).send(su+mo+tu+we+th+fr+sa);
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