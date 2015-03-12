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
          return false;
        }
        if (token === "97f0ad9e24ca5e0408a269748d7fe0a0") {
          return false;
        }
        return true;
      },
      methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection.
                 // If the function returns false the action will be canceled, if you return true the action will take place.
        POST: undefined,    // function(obj, requestMetadata) {return true/false;},
        GET: undefined,     // function(objs, requestMetadata) {return true/false;},
        PUT: undefined,     // function(obj, newValues, requestMetadata) {return true/false;},
        DELETE: undefined  // function(obj, requestMetadata) {return true/false;}
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
