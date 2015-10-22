// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema   = new Schema({
    payload: String
});

module.exports = mongoose.model('KotoInventory', EventSchema);