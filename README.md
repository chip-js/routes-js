# Routes.js

Routes.js is a small JavaScript library that provides browser routing for JavaScript applications using HTML5 pushState
and/or hash routing.

## Usage

### Basic

To use Routes.js in your browserify or webpack web app install using npm.

```
npm install routes-js
```

And to use Routes.js in your app:

```js
var router = require('routes-js').create();

router.route('/', function(req) {
  console.log('home page');
  document.body.innerHTML = '<h1>Home</h1><a href="/users">Users</a>';
});

router.route('/users', function(req) {
  console.log('users page');
  document.body.innerHTML = '<h1>Users</h1><a href="/users/42">User 42</a>';
});

router.route('/users/:userId', function(req) {
  console.log('a user page');
  document.body.innerHTML = '<h1>User ' + req.params.userId + '</h1><a href="/">Home</a>';
});
```

### API

#### Options

When creating a router options may be passed in the form of an object hash to customize your router.

 * `use` Use to force your router to use hash-based routing by setting it to `hash`.

A router will use [History.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) by default,
falling back to hash-based routing (using the URL hash as in `index.html#/my/path`) when the browser does not support
`pushState`. Your web server needs to be able to deliver your app's HTML at any URL the application uses. If your server
does not handle this (e.g. if it is hosted from a static file server) you should set your router to use hash-based
routing.

```js
// a prefix isn't needed in hash-based routing
var router = require('routes-js').create({ use: 'hash' });

// pushState routing
var router = require('routes-js').create();
```

#### Hosting the App Somewhere Other Than the Root

Often an application is not hosted at the root URL of a page. When this is the case you don't want to have to use the
full path in your routes. You can easily solve this by putting the root of your app in a `<base>` element on your page.
For example, if your app exists at `http://example.com/mortgage/calculator/` then you would add a base element like the
following to your app HTML page.

```html
<html>
<head>
<base href="/mortgage/calculator">
</head>
<body>
  <app-element></app-element>
</body>
```

A route of `/` would go to `http://example.com/mortgage/calculator/` while a route of `/step2` would go to
`http://example.com/mortgage/calculator/step2`. Note that this is not needed for hash-based routing.

#### Routes

Routes can be strings or regular expressions. They match on URL paths and call an associated callback when the URL
matches. String routes can contain params (`/:paramName`) and wildcard endings (`/*`). The callbacks are called with two
arguments, a request object and a function to pass control to the next route if desired.

The request object (usually shorted to `req`) contains the URL and path strings, and params and query objects, with all
the info.

Here are some examples.

Using params:

```js
router.route('/users', function(req) {
  // display a list of all the users
});

router.route('/users/:userId', function(req) {
  // display the user req.params.userId
});
```

Using passthrough routes to load data or check for login status:

```js
// Define first so that we don't get into a redirect loop
router.route('/login', function(req) {
  // display the login page
});

router.route('/*', function(req, next) {
  // Check if logged in
  if (!data.loggedIn) {
    router.redirect('/login');
    return;
  }

  // Load data for the app if it hasn't been loaded yet
  if (!data.loaded) {
    data.load().then(next);
  }
});

router.route('/users', function(req) {
  // display a list of all the users
});
```

Using wildcard endings:

```js
router.route('/documents/*', function(req) {
  var docUrl = req.params['*']; // /documents/my/doc.doc becomes my/doc.doc
  // display doc
});
```

Using regular expressions:

```js
router.route(/^\/users\/[a-z0-9]{32}$/, function(req) {
  var userId = req.path.replace('/users/');
  // display user
});
```

#### Param

You may register a function to run before any routes that have a matching parameter using `routeer.param`. This can be
used to set or load data.

```js
router.param('userId', function(req, next, userId) {
  if (data.isUserLoaded(userId)) {
    next();
  } else {
    data.loadUser(userId).then(next);
  }
});

router.route('/users/:userId', function(req) {
  var user = data.getLoadedUser(req.params.userId);
  // Display page for user
});
```

In addition, you can pass a regular expression into `param` to enforce the parameter matches before the route will
match.

```js
router.param('userId', /^\d+$/);

router.route('/users/:userId', function(req) {
  // This route will not match /users/current or /users/123abc
  // It will match /users/123 and /users/456819
});

router.route('/profile/:userId', function(req) {
  // All routes that have a param named `userId` will require it to match numbers only
});
```
