#KoTiNode server

*Run using:*

0. alias mongo.start="mongod --dbpath /work/mongodb/"
1. npm start
2. NODE_ENV=prod node server.js
3. NODE_ENV=dev node server.js (DEFAULT)



Notice that we are sending the data as x-www-form-urlencoded. This will send all of our data to the Node server as query strings.