
exports.Router = require('./src/router');
exports.Route = require('./src/route');
exports.Location = require('./src/location');
exports.HashLocation = require('./src/hash-location');
exports.PushLocation = require('./src/push-location');
exports.create = function(options) {
  return new exports.Router(options);
};
