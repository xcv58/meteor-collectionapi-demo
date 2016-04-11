import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { CollectionAPI } from 'meteor/xcv58:collection-api';

const Players = new Mongo.Collection('players');

const notFound = (returnObject, requestMetadata) => {
  Object.assign(returnObject, {
    statusCode: 500,
    body: {
      error: `id${requestMetadata.collectionId} does not exist!`,
    },
  });
};

Meteor.startup(() => {
  // All values listed below are default
  const collectionApi = new CollectionAPI({
    authToken: undefined,               // Require this string to be passed in on each request
    apiPath: 'collectionapi',           // API path prefix
    standAlone: false,                  // Run as a stand-alone HTTP(S) server
    allowCORS: true,                    // Allow CORS (Cross-Origin Resource Sharing)
    sslEnabled: false,                  // Disable/Enable SSL (stand-alone only)
    listenPort: 3005,                   // Port to listen to (stand-alone only)
    listenHost: undefined,              // Host to bind to (stand-alone only)
    privateKeyFile: 'privatekey.pem',   // SSL private key file (only used if SSL is enabled)
    certificateFile: 'certificate.pem', // SSL certificate key file (only used if SSL is enabled)
  });

  // Add the collection Players to the API "/players" path
  collectionApi.addCollection(Players, 'players', {
    // All values listed below are default
    authToken: undefined,                   // Require this string to be passed in on each request
    authenticate: (token, method, requestMetadata) => {
      /*eslint-disable */
      console.log('authen');
      console.log('token:', token);
      console.log('method:', method);
      console.log('requestMetadata:', JSON.stringify(requestMetadata));
      /*eslint-enable */
      if (token === undefined) {
        return true;
      }
      if (token === '97f0ad9e24ca5e0408a269748d7fe0a0') {
        return false;
      }
      return true;
    },
    methods: ['POST', 'GET', 'PUT', 'DELETE'],  // Allow creating, reading, updating, and deleting
    before: {
      /*
       * This methods, if defined, will be called before the POST/GET/PUT/DELETE actions
       * are performed on the collection.
       * If the function returns false the action will be canceled,
       * if you return true the action will take place.
       */
      POST(obj, requestMetadata, returnObject) {
        // always set returnObject.success = true, if you want handle it by yourself!
        const success = true;
        Object.assign(returnObject, { success });

        // only allow obj to insert with 'id' key exists.
        const hasId = obj.hasOwnProperty('id');
        if (hasId) {
          try {
            const id = Players.insert(obj);
            Object.assign(returnObject, {
              statusCode: 201,
              body: { obj, method: 'POST' },
            });
            Object.assign(obj, { _id: id });
          } catch (e) {
            Object.assign(returnObject, {
              statusCode: 500,
              body: { error: e.toString() },
            });
          }
        } else {
          Object.assign(returnObject, {
            statusCode: 500,
            body: { error: 'no id' },
          });
        }
        return true;
      },
      // GET: undefined,     // function(objs, requestMetadata, returnObject) {return true/false;},
      GET(objs, requestMetadata, returnObject) {
        const success = true;
        Object.assign(returnObject, { success });

        // only expose obj with no _del or _del === false
        // You may need manually get objs if you pass in an invalid collection
        const filteredObjs = [];
        objs.forEach(obj => {
          if (!obj.hasOwnProperty('_del') || obj._del === false) {
            filteredObjs.push(obj);
          }
        });
        Object.assign(returnObject, {
          statusCode: 200,
          body: {
            method: 'GET',
            objs: filteredObjs,
          },
        });
        return true;
      },
      PUT(obj, newValues, requestMetadata, returnObject) {
        const success = true;
        Object.assign(returnObject, { success });

        // if (!obj || obj._del === true) {
        // even _del equals true, user still can set it to false to activate it.
        if (!obj) {
          notFound(returnObject, requestMetadata);
          return true;
        }

        try {
          const updatedObj = Players.update(obj._id, newValues);
          Object.assign(returnObject, {
            statusCode: 200,
            body: {
              method: 'PUT',
              obj: updatedObj,
            },
          });
        } catch (e) {
          Object.assign(returnObject, {
            statusCode: 500,
            body: {
              error: e.toString(),
            },
          });
        }

        return true;
      },
      // DELETE: undefined  // function(obj, requestMetadata, returnObject) {return true/false;}
      DELETE(obj, requestMetadata, returnObject) {
        const success = true;
        Object.assign(returnObject, { success });

        if (!obj || obj._del === true) {
          notFound(returnObject, requestMetadata);
          return true;
        }

        try {
          Players.update(obj._id, {
            $set: { _del: true },
          });
          Object.assign(returnObject, {
            statusCode: 200,
            body: { method: 'DELETE' },
          });
        } catch (e) {
          Object.assign(returnObject, {
            statusCode: 500,
            body: { error: e.toString() },
          });
        }

        return true;
      },
    },
    after: {
      /*
       * This methods, if defined, will be called after the POST/GET/PUT/DELETE
       * actions are performed on the collection.
       * Generally, you don't need this, unless you have global variable to reflect
       * data inside collection.
       * The function doesn't need return value.
       */
       //
      POST: undefined,    // function() {console.log("After POST");},
      GET: undefined,     // function() {console.log("After GET");},
      PUT: undefined,     // function() {console.log("After PUT");},
      DELETE: undefined,  // function() {console.log("After DELETE");},
    },
  });

  // Starts the API server
  collectionApi.start();
});
