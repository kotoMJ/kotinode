var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserItemSchema = new Schema({
    role: {type: String, required: true},
    name: [{value: {type: String, required: true}, primary: {type: Boolean, required: true}}],
    surname: {type: String, required: true},
    phone: [{value: {type: Number, required: false}, type: {type: String, required: true}}],
    email: [{value: {type: String, required: false}, type: {type: String, required: true}}],
    address: {
        municipality: {value: String, required: true},
        houseNumber: {value: Number, required: true},
        zip: {value: Number, required: true}
    },
    passwordHash: {
        type: String, required: false
    }
});

module.exports = mongoose.model('KotoUserItem', UserItemSchema);