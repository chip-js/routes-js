module.exports = HashLocation;
var Location = require('./location');


// Location implementation for using the URL hash
function HashLocation(options) {
  Location.call(this, options);
  this.historyEventName = 'hashchange';
}

Location.extend(HashLocation, {
  get url() {
    return location.hash.replace(/^#\/?/, '/') || '/';
  },

  set url(value) {
    if (value.charAt(0) === '.' || value.split('//').length > 1) {
      value = this.getRelativeUrl(value);
    }

    location.hash = (value === '/' ? '' : '#' + value);
  }

});
