module.exports = PushLocation;
var Location = require('./location');
var uriParts = document.createElement('a');

// Location implementation for using pushState
function PushLocation(options) {
  Location.call(this, options);
  this.options = options || {};
  this.historyEventName = 'popstate';
}

Location.extend(PushLocation, {
  static: {
    get supported() {
      return window.history && window.history.pushState && true;
    }
  },

  get url() {
    var prefix = this.options.prefix;
    var path = location.pathname;
    if (prefix && path.indexOf(prefix) === 0) {
      path = path.replace(prefix, '');
    }
    return path + location.search;
  },

  set url(value) {
    if (value.charAt(0) === '.' || value.split('//').length > 1) {
      value = this.getRelativePath(value);
    } else {
      value = (this.options.prefix || '') + value;
    }

    if (this.currentUrl !== value) {
      history.pushState({}, '', value);
      // Manually change since no event is dispatched when using pushState/replaceState
      this._changeTo(value);
    }
  }
});
