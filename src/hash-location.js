module.exports = HashLocation;
var Location = require('./location');


// Location implementation for using the URL hash
function HashLocation() {
  Location.call(this);
}

Location.extend(HashLocation, {
  historyEventName: 'hashchange',

  redirect: function(value, replace) {
    if (replace && window.history && window.history.replaceState) {
      if (value.charAt(0) !== '/' || value.split('//').length > 1) {
        value = this.getRelativeUrl(value);
      }
      history.replaceState({}, '', '#' + value);
      this._changeTo(value, replace);
    } else {
      this.url = value;
    }
  },

  get url() {
    return location.hash.replace(/^#\/?/, '/') || '/';
  },

  set url(value) {
    if (value.charAt(0) !== '/' || value.split('//').length > 1) {
      value = this.getRelativeUrl(value);
    }

    location.hash = (value === '/' ? '' : '#' + value);
  }

});
