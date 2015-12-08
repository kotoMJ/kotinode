// app/models/bear.js
//http://mongoosejs.com/docs/2.7.x/docs/schematypes.html

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema   = new Schema({
    headline: String,
    label: [String],
    eventDate: Date,//30.09.2015 01Z
    eventLocation : [String],
    textCapital : String,
    text : String,
    imageResource: String
});

module.exports = mongoose.model('KotoEvent', EventSchema);