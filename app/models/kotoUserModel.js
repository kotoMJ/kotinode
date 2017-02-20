var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserItemSchema = new Schema({
    role: {type: String, required: true},
    name: [{value: {type: String, required: true}, primary: {type: Boolean, required: true}}],
    surname: {type: String, required: true},
    phone: [{
        value: {type: Number, required: false},
        type: {type: String, required: true},
        countryCode: {type: Number, required: true}
    }],
    email: [{value: {type: String, required: false}, type: {type: String, required: true}}],
    address: [{
        municipality: {type: String, required: true},
        houseNumber: {type: Number, required: true},
        zip: {type: Number, required: true},
        permanent: {type: Boolean, required: true}
    }],
    passwordHash: {
        type: String, required: false
    },
    tagList: [{type: String, required: false}]
});

module.exports = mongoose.model('KotoUserItem', UserItemSchema);