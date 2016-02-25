
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GallerySummarySchema   = new Schema({
    id: { type: Number, required: true, unique: true},
    galleryName: { type:String, required: true},
    galleryTitle: { type:String, required: true},
    galleryDescription: { type:String, required: true},
    galleryDate:  { type:Date, required: true},//30.09.2015 01Z
    galleryUrl: { type:String, required: true},
    digestPhotoUrl: { type:String, required: true}
});

module.exports = mongoose.model('KotoGallerySummary', GallerySummarySchema);