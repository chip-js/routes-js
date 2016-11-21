module.exports = Location;
var EventTarget = require('chip-utils/event-target');
var doc = document.implementation.createHTMLDocument('');
var base = doc.createElement('base');
var anchor = doc.createElement('a');
var bases = document.getElementsByTagName('base');
var baseURI = bases[0] ? bases[0].href : location.protocol + '//' + location.host + '/';
var PushLocation, pushLocation;
var HashLocation, hashLocation;
doc.body.appendChild(base);
doc.body.appendChild(anchor);


function Location() {
  EventTarget.call(this);
  this._handleChange = this._handleChange.bind(this);
  this.baseURI = baseURI.replace(/\/$/, '');
  this.currentUrl = this.url;
  window.addEventListener(this.historyEventName, this._handleChange);
}

EventTarget.extend(Location, {
  static: {
    create: function(options) {
      if (options.use === 'hash' || !PushLocation.supported) {
        return hashLocation || (hashLocation = new HashLocation());
      } else {
        return pushLocation || (pushLocation = new PushLocation());
      }
    },

    get supported() {
      return true;
    }
  },

  historyEventName: '',
  base: base,
  anchor: anchor,

  getRelativeUrl: function(url) {
    base.href = this.baseURI + this.currentUrl;
    anchor.href = url;
    url = anchor.pathname + anchor.search;
    // Fix IE's missing slash prefix
    return (url[0] === '/') ? url : '/' + url;
  },

  getPath: function(url) {
    base.href = this.baseURI + this.currentUrl;
    anchor.href = url;
    var path = anchor.pathname;
    // Fix IE's missing slash prefix
    return (path[0] === '/') ? path : '/' + path;
  },

  redirect: function(url, replace) {
    this.url = url;
  },

  get url() {
    throw new Error('Abstract method. Override');
  },

  set url(value) {
    throw new Error('Abstract method. Override');
  },

  get path() {
    return this.currentUrl.split('?').shift();
  },

  get query() {
    return parseQuery(this.currentUrl.split('?').slice(1).join('?'));
  },

  _changeTo: function(url, replace) {
    this.currentUrl = url;
    this.dispatchEvent(new CustomEvent('change', { detail: {
      url: url,
      path: this.path,
      query: this.query,
      replace: replace || false
    }}));
  },

  _handleChange: function() {
    var url = this.url;
    if (this.currentUrl !== url) {
      this._changeTo(url);
    }
  }
});


// Parses a location.search string into an object with key-value pairs.
function parseQuery(search) {
  var query = {};

  search.replace(/^\?/, '').split('&').filter(Boolean).forEach(function(keyValue) {
    var parts = keyValue.split('=');
    var key = parts[0];
    var value = parts[1];
    query[decodeURIComponent(key)] = decodeURIComponent(value);
  });

  return query;
}

PushLocation = require('./push-location');
HashLocation = require('./hash-location');
