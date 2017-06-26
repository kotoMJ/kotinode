var fs = require('fs');
var logger = require('../utils/logger.js');


// ----------------------------------------------------
// CRUD FOR LIST of CLASS
// http://url:port/api/dbshowcase/class
// ----------------------------------------------------

exports.getAnimalKoto = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/animal.koto.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

exports.getAnimalInsects = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/animal.insects.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};
