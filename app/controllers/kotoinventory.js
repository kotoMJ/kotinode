var KotoEvent     = require('../models/kotoinventory');


// ----------------------------------------------------
// CRUD FOR LIST of EVENTS
// http://url:port/api/kotinode/inventory
// ---------------------------------------------------

exports.postInventory = function(req, res) {
    console.log("/kotinode inventory post");
    var kotoevent = new KotoEvent();      // create a new instance of the KotoEvent model
    console.log('req.body='+req.body);
    res.json(req.body);
}

exports.getInventory = function(req, res){
    KotoInventory.find(function(err, inventory) {
        if (err)
            res.send(err);

        res.json(inventory);
    });
}
