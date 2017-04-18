var KotoEventModel = require('../models/kotoEventModel');
var KotoNotifyModel = require('../models/kotoNotifyModel');
var KotoAuthController = require('../controllers/kotoAuthController')
const constants = require('../utils/const')


exports.resolvers = {
    Query: {
        eventBundles(root, args, context) {
            return KotoEventModel.find().sort({ date: constants.DESC_SORT_ORDER }).exec()
        },
        notification(root, args, context){
            try {
                return KotoAuthController.verifyGQLTokenPromise(context.requestId, context.apiToken)
                    .then(() => KotoNotifyModel.find().sort({ messageArriveDateTime: constants.DESC_SORT_ORDER }).exec())
            } catch (err) {
                return err

            }
        }
    },
    Date: {
        __parseValue(value) {
            return new Date(value); // value from the client
        },
        __serialize(value) {
            return value.toISOString(); // value sent to the client
        },
        // __parseLiteral(ast) {
        //     if (ast.kind === Kind.INT) {
        //         return parseInt(ast.value, 10); // ast value is always in string format
        //     }
        //     return null;
        // }
    },
}
