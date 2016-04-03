module.exports = PushLocation;
var Location = require('./location');
var uriParts = document.createElement('a');

// Location implementation for using pushState
function PushLocation() {
  Location.call(this);
}

Location.extend(PushLocation, {
  static: {
    get supported() {
      return window.history && window.history.pushState && true;
    }
  },

  historyEventName: 'popstate',

  get url() {
    return location.href.replace(this.baseURI, '').split('#').shift();
  },

  set url(value) {
    if (value.charAt(0) !== '/' || value.split('//').length > 1) {
      value = this.getRelativeUrl(value);
    }

    if (this.currentUrl !== value) {
      history.pushState({}, '', value);
      // Manually change since no event is dispatched when using pushState/replaceState
      this._changeTo(value);
    }
  }
});
