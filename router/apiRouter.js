var express = require('express');

var kotoAuthController = require('../app/controllers/kotoAuthController');
var kotoEventController = require('../app/controllers/kotoEventController');
var kotoGalleryController = require('../app/controllers/kotoGalleryController');
var kotoAdminController = require('../app/controllers/kotoAdminController');
var kotoUserController = require('../app/controllers/kotoUserController');
var kotiHeatingController = require('../app/controllers/kotiHeatingController');
var kotoNotifyController = require('../app/controllers/kotoNotifyController');
var showcaseController = require('../app/controllers/showcaseController');
var demoTransparentAccount = require('../app/controllers/demoaccounts');
var animalController = require('../app/controllers/kotoAnimalController');
var logger = require('../app/utils/logger.js');
exports.getApiRouter = function () {

    var api_router = express.Router();

    // middleware to use for all requests
    api_router.use(function (req, res, next) {
        //init api request id to header
        var rid = Math.floor((Math.random() * 1000000000000) + 1);
        console.log('rid:' + rid);
        req.headers['rid'] = rid;
        logger.log(req, 'rid test');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "DELETE,GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Access-Control-Allow-Origin, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Accept, apitoken");

        //log basic incomming params
        logger.log(req, 'params:' + JSON.stringify(req.params));
        logger.log(req, 'query:' + JSON.stringify(req.query));
        logger.log(req, 'headers:' + JSON.stringify(req.headers));
        logger.log(req, 'method:' + req.method);
        logger.log(req, 'route:' + req.url);
        next(); // make sure we go to the next routes and don't stop here
    });

    // ===== ROUTE to SERVER API ========
// ----------------------------------------------------
// KOTO LOGIN - JWT AUTH
// ----------------------------------------------------
    api_router.route('/')
        .options(kotoAuthController.preflight);

    api_router.route('/kotinode/login')
        .post(function (req, res, next) {
            kotoAuthController.postKotoLogin(req, res);
        })
        .options(kotoAuthController.preflight);
// ----------------------------------------------------
// KOTO ADMIN
// ----------------------------------------------------
    api_router.route('/kotinode/admin')
        .delete(kotoAdminController.drop)
        .purge(kotoAdminController.drop);

    api_router.route('/kotinode/admin/gallery')
        .patch(kotoAdminController.sortGallerySummary)
        .delete(kotoAdminController.reset_gallery)
        .purge(kotoAdminController.reset_gallery);

    api_router.route('/kotinode/admin/user')
        .purge(kotoAdminController.reset_user);

// ----------------------------------------------------
// DEMO ACCOUNT
// ----------------------------------------------------

    api_router.route('/kotinode/account')
        .get(demoTransparentAccount.getAccounts);


    api_router.route('/kotinode/transaction')
        .get(demoTransparentAccount.getTransactions);

// ----------------------------------------------------
// KOTOEVENT
// ----------------------------------------------------

    api_router.route('/kotinode/event/bundle')
        .get(kotoEventController.getBundleList)
        .post(kotoEventController.createEventBundle)

    api_router.route('/kotinode/event/bundle/:bundle_id')
        .put(kotoEventController.addEventToBundle)
        .delete(kotoEventController.deleteEventBundle)

    api_router.route('/kotinode/event')
        .get(kotoEventController.getEventList)
        .purge(kotoEventController.cleanupEventBundleAll)

    api_router.route('/kotinode/event/fixed')
        .get(kotoEventController.getEventFixed);

    api_router.route('/kotinode/event/:event_id/bundle/:bundle_id')
        .delete(kotoEventController.deleteEventFromBundle)

// ----------------------------------------------------
// KOTO NOTIFY
// ----------------------------------------------------

    api_router.route('/kotinode/notify/sms/credit')
        .get(kotoNotifyController.getSmsCredit);

    api_router.route('/kotinode/notify')
        .post(kotoNotifyController.notify)
        .get(kotoNotifyController.getNotificationList)
        .purge(kotoNotifyController.deleteNotify);


// ----------------------------------------------------
// KOTO GALLERY
// ----------------------------------------------------

    api_router.route('/kotinode/gallery')
        .get(function (req, res, next) {
            kotoGalleryController.getGallerySummary(req, res);
        });

    api_router.route('/kotinode/gallery/fixed')
        .get(kotoGalleryController.getGalleryFixed);

    api_router.route('/kotinode/gallery/:galleryName')
        .get(function (req, res, next) {
            kotoGalleryController.getGallery(req, res);
        });

// ----------------------------------------------------
// KOTOUSER
// ----------------------------------------------------
    api_router.route('/kotinode/user')
        .get(kotoUserController.getUserList)
        .post(kotoUserController.createUser)
        .delete(kotoUserController.deleteUsers)
        .purge(kotoUserController.deleteUsers);

    api_router.route('/kotinode/user/tag')
        .get(kotoUserController.getAllTags);

    api_router.route('/kotinode/user/:user_id')
        .get(kotoUserController.getUserById)
        .delete(kotoUserController.deleteUserById)
        .put(kotoUserController.replaceUserById);

// ----------------------------------------------------
// HEATING
// ----------------------------------------------------

    api_router.route('/kotinode/heating/status/:heating_id')
        .post(kotiHeatingController.saveHeatingStatus)
        .get(kotiHeatingController.getHeatingStatus);

    api_router.route('/kotinode/heating/schedule/:heating_id')
        .post(kotiHeatingController.setHeatingSchedule);

    //Attention, schedule/raw must be applied before schedule
    api_router.route('/kotinode/heating/schedule/raw/:heating_id')
        .get(kotiHeatingController.getHeatingScheduleRaw);

    api_router.route('/kotinode/heating/schedule/:heating_id/:type_id')
        .get(kotiHeatingController.getHeatingSchedule);

    api_router.route('/kotinode/cert')
        .get(kotiHeatingController.getCert);

    api_router.route('/kotinode/heating/cleanup')
        .delete(kotiHeatingController.cleanupHeatingData);


// ----------------------------------------------------
// DB SHOWCASE - CLASS
// ----------------------------------------------------
    api_router.route('/dbshowcase/class')
        .get(function (req, res, next) {
            showcaseController.getShowcaseClassFixed(req, res);
        });

// ----------------------------------------------------
// DB SHOWCASE - STUDENT
// ----------------------------------------------------
    api_router.route('/dbshowcase/student')
        .get(function (req, res, next) {
            showcaseController.getShowcaseStudentFixed(req, res);
        });

// ----------------------------------------------------
// DB SHOWCASE - STUDENT
// ----------------------------------------------------
    api_router.route('/dbshowcase/teacher')
        .get(function (req, res, next) {
            showcaseController.getShowcaseTeacherFixed(req, res);
        });

// ----------------------------------------------------
// SECURITY SHOWCASE - JWT AUTH
// ----------------------------------------------------

    api_router.route('/securityshowcase/jwtLogin')
        .post(function (req, res, next) {
            kotoAuthController.postKotoLogin(req, res);
        })
        .options(kotoAuthController.preflight);

    api_router.route('/securityshowcase/login')
        .post(function (req, res, next) {
            showcaseController.postShowcaseSecurityLogin(req, res);
        });

// ----------------------------------------------------
// AUTH
// ----------------------------------------------------

    api_router.route('/kotinode/auth/google')
        .post(function (req, res, next) {
            kotoAuthController.authorizeUser(req, res);
        });

// ----------------------------------------------------
// ANIMALS
// ----------------------------------------------------

    api_router.route('/animals/koto')
        .get(function (req, res, next) {
            animalController.getAnimalKoto(req, res);
        });

    api_router.route('/animals/insect')
        .get(function (req, res, next) {
            animalController.getAnimalInsects(req, res);
        });


    return api_router;
}