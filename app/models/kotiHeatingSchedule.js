var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KotiHeatingSchedule = new Schema({
    heatingId: {type: Number, unique: true},
    timetable: [[{type: Number, required: true}]],
    validity: {type: Date}
});

module.exports = mongoose.model('KotiHeatingSchedule', KotiHeatingSchedule);