var fs = require('fs');
var logger = require('../utils/logger.js');


// ----------------------------------------------------
// CRUD FOR LIST of CLASS
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseClassFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.class.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// ----------------------------------------------------
// CRUD FOR LIST of STUDENT
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseStudentFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.student.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};
// ----------------------------------------------------
// CRUD FOR LIST of TEACHER
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseTeacherFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.teacher.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// ----------------------------------------------------
// SIMPLE AUTHORIZATION for security showcase
// http://url:port/api/securityshowcase/login
// ----------------------------------------------------

exports.postShowcaseSecurityLogin = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if ((username === "SecurityShowcaseUser") && (password === "passW0rd1234")) {
        res.json({
            "dataValue": {
                "username": username,
                "userId": "1",
                "token": "JC3bj7vZNh12A4X+kHieMRVublL0bI89EWQucVvgZomrQyq3ri6MUZhFDZCwdPMhyBRtJstBkYPi6MPV8gXwEaq2WIBkiYSKRjWouRsRCClFjKBWRZgP4NZMmNv7I3cJel6IAmOZ95JKHXzpyyfOGNPXibIb+HrTtVwZRQOVqXNWlDilKpf/UHsN+Xy1rkIlmmBWQ3dLlN9sSE2L8JLTbbEETc2T25Pt+D7FJ/hFVeo3yHJkhpRMZvSI3aGYtMegNgbynwPbEga136pdqu9lfmGTlS1mjNwOz+jZ+nxs7KTWEXBs8xEJ9KExW0Riee7zElwABfe8r9Qsqk49WbnZ/gjnGs+g2FLdIYElA7rUNVR9l/u9XTFNg5cNEKur1BPC",
                "successful": true,
            }
        })
    } else {
        res.json({
            "dataValue": {
                "username": username,
                "userId": "1",
                "token": "",
                "successful": false,
                "message": "Username or password invalid."
            }
        })
    }

};