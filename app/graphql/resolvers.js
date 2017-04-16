var KotoEventModel = require('../models/kotoEventModel');
const constants = require('../utils/const')

exports.resolvers = {
    Query: {
        eventBundles(root, args, context) {
            return KotoEventModel.find().sort({ date: constants.DESC_SORT_ORDER }).exec()
        },
    }
}