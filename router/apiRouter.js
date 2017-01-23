var express = require('express');

var kotoEventController = require('../app/controllers/kotoEventController');
var kotoGalleryController = require('../app/controllers/kotoGalleryController');
var kotoAdminController = require('../app/controllers/kotoAdminController');
var kotoUserController = require('../app/controllers/kotoUserController');
var showcaseController = require('../app/controllers/showcaseController');
var demoTransparentAccount = require('../app/controllers/demoaccounts');
var logger = require('../app/utils/logger.js');
exports.getApiRouter = function () {

    var api_router = express.Router();

    // middleware to use for all requests
    api_router.use(function (req, res, next) {
        //init api request id to header
        var rid = Math.floor((Math.random() * 1000000000000) + 1);
        req.headers['rid'] = rid;
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Access-Control-Allow-Origin, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Accept");

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
// LOGIN - JWT AUTH
// ----------------------------------------------------
    api_router.route('/')
        .options(kotoUserController.preflight);

    api_router.route('/kotinode/login')
        .get(kotoUserController.empty)
        .post(function (req, res, next) {
            kotoUserController.postKotoLogin(req, res);
        })
        .put(kotoUserController.empty)
        .patch(kotoUserController.empty)
        .delete(kotoUserController.empty)
        .purge(kotoUserController.empty)
        .options(kotoUserController.preflight);
// ----------------------------------------------------
// ADMIN
// ----------------------------------------------------
    api_router.route('/kotinode/admin')
        .get(kotoAdminController.empty)
        .post(kotoAdminController.empty)
        .put(kotoAdminController.empty)
        .patch(kotoAdminController.empty)
        .delete(kotoAdminController.drop)
        .purge(kotoAdminController.drop)

    api_router.route('/kotinode/admin/event')
        .get(kotoAdminController.empty)
        .post(kotoAdminController.empty)
        .put(kotoAdminController.empty)
        .patch(kotoAdminController.sortEvent)
        .delete(kotoAdminController.reset_event)
        .purge(kotoAdminController.reset_event)

    api_router.route('/kotinode/admin/gallery')
        .get(kotoAdminController.empty)
        .post(kotoAdminController.empty)
        .put(kotoAdminController.empty)
        .patch(kotoAdminController.sortGallerySummary)
        .delete(kotoAdminController.reset_gallery)
        .purge(kotoAdminController.reset_gallery)

// ----------------------------------------------------
// DEMO ACCOUNT
// ----------------------------------------------------

    api_router.route('/kotinode/account')

        .get(demoTransparentAccount.getAccounts)


    api_router.route('/kotinode/transaction')

        .get(demoTransparentAccount.getTransactions)

// ----------------------------------------------------
// KOTOEVENT
// ----------------------------------------------------
    api_router.route('/kotinode/event')
        .get(function (req, res, next) {
            kotoEventController.getEvents(req, res);
        })
        .post(kotoEventController.empty)
        .put(kotoEventController.empty)
        .patch(kotoEventController.empty)
        .delete(kotoEventController.empty)
        .purge(kotoEventController.empty);

    api_router.route('/kotinode/event/fixed')
        .get(kotoEventController.getEventsFixed)
        .post(kotoEventController.empty)
        .put(kotoEventController.empty)
        .patch(kotoEventController.empty)
        .delete(kotoEventController.empty)
        .purge(kotoEventController.empty);

    api_router.route('/kotinode/event/:kotoevent_id')
        .get(kotoEventController.empty)
        .put(kotoEventController.empty)
        .delete(kotoEventController.empty);

// ----------------------------------------------------
// GALLERY
// ----------------------------------------------------

    api_router.route('/kotinode/gallery')
        .get(function (req, res, next) {
            kotoGalleryController.getGallerySummary(req, res);
        })
        .post(kotoGalleryController.empty)
        .put(kotoGalleryController.empty)
        .patch(kotoGalleryController.empty)
        .delete(kotoGalleryController.empty)
        .purge(kotoGalleryController.empty);

    api_router.route('/kotinode/gallery/:galleryName')
        .get(function (req, res, next) {
            kotoGalleryController.getGallery(req, res);
        })
        .post(kotoGalleryController.empty)
        .put(kotoGalleryController.empty)
        .patch(kotoGalleryController.empty)
        .delete(kotoGalleryController.empty)
        .purge(kotoGalleryController.empty);


    api_router.route('/kotinode/gallery/fixed')
        .get(kotoGalleryController.getGalleryFixed)
        .post(kotoGalleryController.empty)
        .put(kotoGalleryController.empty)
        .patch(kotoGalleryController.empty)
        .delete(kotoGalleryController.empty)
        .purge(kotoGalleryController.empty);

// ----------------------------------------------------
// DB SHOWCASE - CLASS
// ----------------------------------------------------
    api_router.route('/dbshowcase/class')
        .get(function (req, res, next) {
            showcaseController.getShowcaseClassFixed(req, res);
        })
        .post(showcaseController.empty)
        .put(showcaseController.empty)
        .patch(showcaseController.empty)
        .delete(showcaseController.empty)
        .purge(showcaseController.empty);

// ----------------------------------------------------
// DB SHOWCASE - STUDENT
// ----------------------------------------------------
    api_router.route('/dbshowcase/student')
        .get(function (req, res, next) {
            showcaseController.getShowcaseStudentFixed(req, res);
        })
        .post(showcaseController.empty)
        .put(showcaseController.empty)
        .patch(showcaseController.empty)
        .delete(showcaseController.empty)
        .purge(showcaseController.empty);

// ----------------------------------------------------
// DB SHOWCASE - STUDENT
// ----------------------------------------------------
    api_router.route('/dbshowcase/teacher')
        .get(function (req, res, next) {
            showcaseController.getShowcaseTeacherFixed(req, res);
        })
        .post(showcaseController.empty)
        .put(showcaseController.empty)
        .patch(showcaseController.empty)
        .delete(showcaseController.empty)
        .purge(showcaseController.empty);


// ----------------------------------------------------
// SECURITY SHOWCASE - SIMPLE AUTH
// ----------------------------------------------------

    api_router.route('/securityshowcase/login')
        .get(showcaseController.empty)
        .post(function (req, res, next) {
            showcaseController.postShowcaseSecurityLogin(req, res);
        })
        .put(showcaseController.empty)
        .patch(showcaseController.empty)
        .delete(showcaseController.empty)
        .purge(showcaseController.empty);


    return api_router;
}