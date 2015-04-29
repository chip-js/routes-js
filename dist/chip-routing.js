var Route, Router, parsePath, parseQuery, pathname;

Router = (function() {
  function Router() {
    this.routes = [];
    this.params = {};
    this.paramsExp = {};
    this.prefix = '';
    makeEventEmitter(this);
  }

  Router.prototype.param = function(name, callback) {
    if (!(typeof callback === 'function' || callback instanceof RegExp)) {
      throw new Error('param must have a callback of type "function" or RegExp. Got ' + callback + '.');
    }
    if (typeof callback === 'function') {
      (this.params[name] || (this.params[name] = [])).push(callback);
    } else {
      this.paramsExp[name] = callback;
    }
    return this;
  };

  Router.prototype.route = function(path, callback) {
    if (typeof callback !== 'function') {
      throw new Error('route must have a callback of type "function". Got ' + callback + '.');
    }
    if (typeof path === 'string') {
      path = '/' + path;
      path = path.replace(/\/{2,}/g, '/');
    }
    this.routes.push(new Route(path, callback));
    return this;
  };

  Router.prototype.redirect = function(url, replace) {
    var errHandler, notFound, pathParts;
    if (replace == null) {
      replace = false;
    }
    if (url.charAt(0) === '.' || url.split('//').length > 1) {
      pathParts = document.createElement('a');
      pathParts.href = url;
      url = pathname(pathParts) + pathParts.search;
    } else {
      url = this.prefix + url;
    }
    if (this.currentUrl === url) {
      return;
    }
    if (!this.hashOnly && this.root && url.indexOf(this.root) !== 0) {
      location.href = url;
      return;
    }
    notFound = false;
    this.on('error', (errHandler = function(err) {
      if (err === 'notFound') {
        return notFound = true;
      }
    }));
    if (this.usePushState) {
      if (replace) {
        history.replaceState({}, '', url);
      } else {
        history.pushState({}, '', url);
      }
      this.currentUrl = url;
      this.dispatch(url);
    } else {
      if (!this.hashOnly) {
        url = url.replace(this.root, '');
        if (url.charAt(0) !== '/') {
          url = '/' + url;
        }
      }
      location.hash = url === '/' ? '' : '#' + url;
    }
    this.off('error', errHandler);
    return !notFound;
  };

  Router.prototype.listen = function(options) {
    var getUrl, ref, url;
    if (options == null) {
      options = {};
    }
    if (options.stop) {
      if (this._handleChange) {
        $(window).off('popstate hashChange', this._handleChange);
      }
      return this;
    }
    if (options.root != null) {
      this.root = options.root;
    }
    if (options.prefix != null) {
      this.prefix = options.prefix;
    }
    if (options.hashOnly != null) {
      this.hashOnly = options.hashOnly;
    }
    this.usePushState = !this.hashOnly && (((ref = window.history) != null ? ref.pushState : void 0) != null);
    if ((this.root == null) && !this.usePushState) {
      this.hashOnly = true;
    }
    if (this.hashOnly) {
      this.prefix = '';
    }
    getUrl = null;
    this._handleChange = (function(_this) {
      return function() {
        var url;
        url = getUrl();
        if (_this.currentUrl === url) {
          return;
        }
        _this.currentUrl = url;
        return _this.dispatch(url);
      };
    })(this);
    if (this.usePushState) {
      if (location.hash) {
        url = location.pathname.replace(/\/$/, '') + location.hash.replace(/^#?\/?/, '/');
        history.replaceState({}, '', url);
      }
      getUrl = function() {
        return location.pathname + location.search;
      };
      $(window).on('popstate', this._handleChange);
    } else {
      getUrl = (function(_this) {
        return function() {
          if (location.hash) {
            return location.hash.replace(/^#\/?/, '/');
          } else {
            return location.pathname + location.search;
          }
        };
      })(this);
      $(window).on('hashchange', this._handleChange);
    }
    this._handleChange();
    return this;
  };

  Router.prototype.getUrlParts = function(url) {
    var path, urlParts;
    urlParts = document.createElement('a');
    urlParts.href = url;
    path = pathname(urlParts);
    if (path.indexOf(this.prefix) !== 0) {
      return null;
    }
    path = path.replace(this.prefix, '');
    if (path.charAt(0) !== '/') {
      path = '/' + path;
    }
    return {
      path: path,
      query: urlParts.search
    };
  };

  Router.prototype.getRoutesMatchingPath = function(path) {
    if (path == null) {
      return [];
    }
    return this.routes.filter((function(_this) {
      return function(route) {
        var key, ref, value;
        if (!route.match(path)) {
          return false;
        }
        ref = route.params;
        for (key in ref) {
          value = ref[key];
          if (!_this.paramsExp[key]) {
            continue;
          }
          if (!_this.paramsExp[key].test(value)) {
            return false;
          }
        }
        return true;
      };
    })(this));
  };

  Router.prototype.dispatch = function(url) {
    var callbacks, next, path, req, routes, urlParts;
    urlParts = this.getUrlParts(url);
    if (!urlParts) {
      return;
    }
    path = urlParts.path;
    req = {
      url: url,
      path: path,
      query: parseQuery(urlParts.query)
    };
    this.trigger('change', [path]);
    routes = this.getRoutesMatchingPath(path);
    callbacks = [];
    routes.forEach((function(_this) {
      return function(route) {
        var key, ref, value;
        callbacks.push(function(req, next) {
          req.params = route.params;
          return next();
        });
        ref = route.params;
        for (key in ref) {
          value = ref[key];
          if (!_this.params[key]) {
            continue;
          }
          callbacks.push.apply(callbacks, _this.params[key]);
        }
        return callbacks.push(route.callback);
      };
    })(this));
    next = (function(_this) {
      return function(err) {
        var callback;
        if (err) {
          return _this.trigger('error', [err]);
        }
        if (callbacks.length === 0) {
          return next('notFound');
        }
        callback = callbacks.shift();
        return callback(req, next);
      };
    })(this);
    if (callbacks.length === 0) {
      next('notFound');
    } else {
      next();
    }
    return this;
  };

  return Router;

})();

chip.Router = Router;

Route = (function() {
  function Route(path, callback) {
    this.path = path;
    this.callback = callback;
    this.keys = [];
    this.expr = parsePath(path, this.keys);
  }

  Route.prototype.match = function(path) {
    var i, j, key, len, match, value;
    if (!(match = this.expr.exec(path))) {
      return false;
    }
    this.params = {};
    for (i = j = 0, len = match.length; j < len; i = ++j) {
      value = match[i];
      if (i === 0) {
        continue;
      }
      key = this.keys[i - 1];
      if (typeof value === 'string') {
        value = decodeURIComponent(value);
      }
      if (!key) {
        key = '*';
      }
      this.params[key] = value;
    }
    return true;
  };

  return Route;

})();

chip.Route = Route;

parsePath = function(path, keys) {
  if (path instanceof RegExp) {
    return path;
  }
  if (Array.isArray(path)) {
    path = '(' + path.join('|') + ')';
  }
  path = path.concat('/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star) {
    var expr;
    keys.push(key);
    slash = slash || '';
    expr = '';
    if (!optional) {
      expr += slash;
    }
    expr += '(?:';
    if (optional) {
      expr += slash;
    }
    expr += format || '';
    expr += capture || (format && '([^/.]+?)' || '([^/]+?)') + ')';
    expr += optional || '';
    if (star) {
      expr += '(/*)?';
    }
    return expr;
  }).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', 'i');
};

parseQuery = function(search) {
  var query;
  query = {};
  if (search === '') {
    return query;
  }
  search.replace(/^\?/, '').split('&').forEach(function(keyValue) {
    var key, ref, value;
    ref = keyValue.split('='), key = ref[0], value = ref[1];
    return query[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return query;
};

pathname = function(anchor) {
  var path;
  path = anchor.pathname;
  if (path.charAt(0) !== '/') {
    path = '/' + path;
  }
  return path;
};
