module.exports = Router;
var Route = require('./route');
var EventTarget = require('chip-utils/event-target');
var Location = require('./location');


// Work inspired by and in some cases based off of work done for Express.js (https://github.com/visionmedia/express)
// Events: error, change
function Router(options) {
  EventTarget.call(this);
  this.options = options || {};
  this.routes = [];
  this.params = {};
  this.paramsExp = {};
  this.routes.byPath = {};
  this.location = Location.create(this.options);
  this.onUrlChange = this.onUrlChange.bind(this);
}


EventTarget.extend(Router, {

  // Registers a `callback` function to be called when the given param `name` is matched in a URL
  param: function(name, callback) {
    if (typeof callback === 'function') {
      (this.params[name] || (this.params[name] = [])).push(callback);
    } else if (callback instanceof RegExp) {
      this.paramsExp[name] = callback;
    } else {
      throw new TypeError('param must have a callback of type "function" or RegExp. Got ' + callback + '.');
    }
  },


  // Registers a `callback` function to be called when the given path matches a URL. The callback receives two
  // arguments, `req`, and `next`, where `req` represents the request and has the properties, `url`, `path`, `params`
  // and `query`. `req.params` is an object with the parameters from the path (e.g. /:username/* would make a params
  // object with two properties, `username` and `*`). `req.query` is an object with key-value pairs from the query
  // portion of the URL.
  route: function(path, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('route must have a callback of type "function". Got ' + callback + '.');
    }

    if (typeof path === 'string' && path[0] !== '/') {
      path = '/' + path;
    }
    this.routes.push(new Route(path, callback));
  },


  removeRoute: function(path, callback) {
    return this.routes.some(function(route, index) {
      if (route.path === path && route.callback === callback) {
        this.routes.splice(index, 1);
        return true;
      }
    });
  },


  redirect: function(url) {
    var notFound = false;
    function errHandler(event) {
      notFound = (event.detail === 'notFound');
    }
    this.on('error', errHandler);

    this.location.url = url;

    this.off('error', errHandler);
    return !notFound;
  },


  listen: function() {
    this.location.on('change', this.onUrlChange);
  },


  stop: function() {
    this.location.off('change', this.onUrlChange);
  },


  getRoutesMatchingPath: function(url) {
    if (url == null) {
      return [];
    }
    var path = this.location.getPath(url);
    var paramsExp = this.paramsExp;

    return this.routes.filter(function(route) {
      if (!route.match(path)) {
        return false;
      }

      var params = route.getParams(path);
      return route.keys.every(function(key) {
        var value = params[key];
        return !paramsExp.hasOwnProperty(key) || (value && paramsExp[key].test(value));
      });
    });
  },


  onUrlChange: function(event) {
    var req = event.detail;
    var path = req.path;
    var paramsCalled = {};

    var event = new CustomEvent('changing', { detail: req, cancelable: true });
    this.dispatchEvent(event);
    if (event.defaultPrevented) {
      return;
    }

    this.dispatchEvent(new CustomEvent('change', { detail: req }));
    var routes = this.getRoutesMatchingPath(path);
    var callbacks = [];
    var handledParams = {};
    var router = this;

    // Add all the callbacks for this URL (all matching routes and the params they're dependent on)
    routes.forEach(function(route) {
      // Add param callbacks when they exist
      route.keys.forEach(function(key) {
        if (router.params.hasOwnProperty(key) && !handledParams.hasOwnProperty(key)) {
          handledParams[key] = true;
          var value = route.params[key];
          router.params[key].forEach(function(paramCallback) {
            callbacks.push(function(req, next) {
              paramCallback(req, next, value);
            });
          });
        }
      });

      // Add route callback
      callbacks.push(route.handle);
    }, this);

    // Calls each callback one by one until either there is an error or we call all of them.
    var next = function(err) {
      if (err) {
        router.dispatchEvent(new CustomEvent('error', { detail: err }));
        return;
      }

      if (!callbacks.length) return next('notFound');
      callback = callbacks.shift();
      callback(req, next);
    };

    // Start running the callbacks, one by one
    next();
  }

});
