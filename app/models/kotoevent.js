// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema   = new Schema({
    date: Date,//30.09.2015 01Z
    name: String,
    description: String,
    note: String
});

module.exports = mongoose.model('KotoEvent', EventSchema);