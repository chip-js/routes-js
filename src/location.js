module.exports = Location;
var EventTarget = require('chip-utils/event-target');
var doc = document.implementation.createHTMLDocument('');
var base = doc.createElement('base');
var anchor = doc.createElement('a');
var domain = location.protocol + '//' + location.host;
var PushLocation;
var HashLocation;
doc.body.appendChild(base);
doc.body.appendChild(anchor);


function Location(options) {
  EventTarget.call(this);
  this.options = options || {};
  this._handleChange = this._handleChange.bind(this);
  this.currentUrl = this.url;
  this.historyEventName = '';
}

EventTarget.extend(Location, {
  static: {
    create: function(options) {
      if (options.use === 'hash' || !PushLocation.supported) {
        return new HashLocation(options);
      } else {
        return new PushLocation(options);
      }
    },

    get supported() {
      return true;
    }
  },

  base: base,
  anchor: anchor,

  getRelativePath: function(basePath, relativeURI) {
    if (arguments.length === 1) {
      relativeURI = basePath;
      base.href = location.href;
    } else {
      base.href = domain + basePath;
    }

    anchor.href = relativeURI;
    var path = anchor.pathname + anchor.search;
    // Fix IE's missing slash prefix
    return (path[0] === '/') ? path : '/' + path;
  },

  get url() {
    throw new Error('Abstract method. Override');
  },

  set url(value) {
    throw new Error('Abstract method. Override');
  },

  listen: function() {
    window.addEventListener(this.historyEventName, this._handleChange);
  },

  stop: function() {
    window.removeEventListener(this.historyEventName, this._handleChange);
  },

  _changeTo: function(url) {
    this.currentUrl = url;
    this.dispatchEvent(new CustomEvent('change', { detail: { url: url }}));
  },

  _handleChange: function() {
    var url = this.url;
    if (this.currentUrl !== url) {
      this._changeTo(url);
    }
  }
});

PushLocation = require('./push-location');
HashLocation = require('./hash-location');
