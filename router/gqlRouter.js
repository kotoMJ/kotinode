var graphqlExpress = require('graphql-server-express').graphqlExpress;
var graphiqlExpress = require('graphql-server-express').graphiqlExpress;
var makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const schema = require('../app/graphql/schema').schema;
const resolvers = require('../app/graphql/resolvers').resolvers;

const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolvers
});


exports.graphqlExpress = graphqlExpress((req) => {
    const requestId = Math.floor((Math.random() * 1000000000000) + 1);

    return {
        schema: executableSchema,
        context: {
            apiToken: req.headers.apitoken,
            requestId: requestId,
        }
    }
})

exports.graphiqlExpress = graphiqlExpress({
    endpointURL: '/graphql'
})