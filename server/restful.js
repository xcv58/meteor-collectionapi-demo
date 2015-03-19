var Players = new Meteor.Collection("players");

if (Meteor.isServer) {
  Meteor.startup(function () {

    // All values listed below are default
    collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'collectionapi',          // API path prefix
      standAlone: false,                 // Run as a stand-alone HTTP(S) server
      sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
      listenPort: 3005,                  // Port to listen to (stand-alone only)
      listenHost: undefined,             // Host to bind to (stand-alone only)
      privateKeyFile: 'privatekey.pem',  // SSL private key file (only used if SSL is enabled)
      certificateFile: 'certificate.pem' // SSL certificate key file (only used if SSL is enabled)
    });

    // Add the collection Players to the API "/players" path
    collectionApi.addCollection(Players, 'players', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request
      authenticate: function(token, method, requestMetadata) {
        console.log("authen");
        console.log("token: " + token);
        console.log("method: " + method);
        console.log("requestMetadata: " + JSON.stringify(requestMetadata));
        if (token === undefined) {
          return true;
        }
        if (token === "97f0ad9e24ca5e0408a269748d7fe0a0") {
          return false;
        }
        return true;
      },
      methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection.
                 // If the function returns false the action will be canceled, if you return true the action will take place.
        // POST: undefined,    // function(obj, requestMetadata, returnObject) {return true/false;},
        POST: function(obj, requestMetadata, returnObject) {
          // always set returnObject.success = true, if you want handle it by yourself!
          returnObject.success = true;

          // only allow obj to insert with 'id' key exists.
          var hasId = obj.hasOwnProperty('id');
          if (hasId) {
            try {
              var id = Players.insert(obj);
              returnObject.statusCode = 201;
              obj._id = id;
              returnObject.body = {
                method: 'POST',
                obj: obj
              };
            } catch (e) {
              returnObject.statusCode = 500;
              returnObject.body = {
                error: e.toString()
              };
            }
          } else {
            returnObject.statusCode = 500;
            returnObject.body = {error: 'no id'};
          }
          return true;
        },
        // GET: undefined,     // function(objs, requestMetadata, returnObject) {return true/false;},
        GET: function (objs, requestMetadata, returnObject) {
          returnObject.success = true;

          // only expose obj with no _del or _del === false
          // You may need manually get objs if you pass in an invalid collection
          returnObject.statusCode = 200;
          var filteredObjs = [];
          objs.forEach(function(obj) {
            if (!obj.hasOwnProperty("_del") || obj._del === false) {
              filteredObjs.push(obj);
            }
          });
          returnObject.body = {
            method: 'GET',
            objs: filteredObjs
          };
          return true;
        },
        // PUT: undefined,     // function(obj, newValues, requestMetadata, returnObject) {return true/false;},
        PUT: function(obj, newValues, requestMetadata, returnObject) {
          returnObject.success = true;

          // if (!obj || obj._del === true) {
          // even _del equals true, user still can set it to false to activate it.
          if (!obj) {
            returnObject.statusCode = 500;
            returnObject.body = {
              error: "id " + requestMetadata.collectionId + " doesn't exist!"
            };
            return true;
          }

          try {
            var updatedObj = Players.update(obj._id, newValues);
            returnObject.statusCode = 200;
            returnObject.body = {
              method: 'PUT',
              obj: updatedObj
            };
          } catch (e) {
              returnObject.statusCode = 500;
              returnObject.body = {
                error: e.toString()
              };
          }

          return true;
        },
        // DELETE: undefined  // function(obj, requestMetadata, returnObject) {return true/false;}
        DELETE: function(obj, requestMetadata, returnObject) {
          returnObject.success = true;

          if (!obj || obj._del === true) {
            returnObject.statusCode = 500;
            returnObject.body = {
              error: "id " + requestMetadata.collectionId + " doesn't exist!"
            };
            return true;
          }

          try {
            Players.update(obj._id, {
              "$set": {
                "_del": true
              }
            });
            returnObject.statusCode = 200;
            returnObject.body = {
              method: 'DELETE'
            };
          } catch (e) {
              returnObject.statusCode = 500;
              returnObject.body = {
                error: e.toString()
              };
          }

          return true;
        }
      },
      after: {  // This methods, if defined, will be called after the POST/GET/PUT/DELETE actions are performed on the collection.
                // Generally, you don't need this, unless you have global variable to reflect data inside collection.
                // The function doesn't need return value.
        POST: undefined,    // function() {console.log("After POST");},
        GET: undefined,     // function() {console.log("After GET");},
        PUT: undefined,     // function() {console.log("After PUT");},
        DELETE: undefined  // function() {console.log("After DELETE");},
      }
    });

    // Starts the API server
    collectionApi.start();
  });
}
