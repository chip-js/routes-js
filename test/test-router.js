var Router = require('../src/router');

describe('Router', function() {
  var router;

  beforeEach(function() {
    router = new Router();
    router.listen();
  });

  afterEach(function() {
    router.stop();
  });


  describe('redirect', function() {

    it('should redirect the URL', function(done) {
      router.redirect('/test/123');
      setTimeout(function() {
        expect(window.location.pathname).to.equal('/test/123');
        done();
      }, 100);
    });

    it('should redirect the URL with a query string', function(done) {
      router.redirect('/test/123?abcd');
      setTimeout(function() {
        expect(window.location.pathname + window.location.search).to.equal('/test/123?abcd');
        done();
      }, 100);
    });

    it('should redirect the hash with a query string', function(done) {
      router = new Router({ use: 'hash' });
      router.redirect('/test/123?abcd');
      setTimeout(function() {
        expect(window.location.hash).to.equal('#/test/123?abcd');
        done();
      }, 100);
    });

  });


  describe('route', function() {

    it('should match a given URL', function(done) {
      router.route('/foo/bar', function(req) {
        // If this fails to match it will timeout
        done();
      });

      router.redirect('/foo/bar');
    });

    it('should match a param', function(done) {
      router.route('/users/:userId', function(req) {
        // If this fails to match it will timeout
        expect(req.params.userId).to.equal('12345');
        done();
      });

      router.redirect('/users/12345');
    });

    it('should match only one route if it does not pass the request on', function(done) {
      router.route('/users/current', function(req, next) {
        setTimeout(function() {
          done();
        });
      });

      router.route('/users/:userId', function(req) {
        throw new Error('This should not have been called');
      });

      router.redirect('/users/current');
    });

    it('should match multiple one routes', function(done) {
      router.route('/users/:userId', function(req, next) {
        next();
      });

      router.route('/users/1234', function(req) {
        done();
      });

      router.redirect('/users/1234');
    });

    it('should have a params and query object and path and url strings', function(done) {
      router.route('/foo/bar', function(req) {
        expect(req.params).to.be.an('object');
        expect(req.query).to.be.an('object');
        expect(req.path).to.equal('/foo/bar');
        expect(req.url).to.equal('/foo/bar?test');
        done();
      });

      router.redirect('/foo/bar?test');
    });

    it('should fill the params and query object', function(done) {
      router.route('/:name', function(req) {
        expect(req.params.name).to.equal('foo');
        expect(req.query.name).to.equal('bar');
        done();
      });

      router.redirect('/foo?name=bar');
    });
  });


  describe('param', function() {

    it('should be called once before a route matches a parameter', function(done) {
      var called = 0;

      router.param('foo', function(req, next, value) {
        called++;
        req.test = true;
        expect(value).to.equal('bar');
        next();
      });

      router.route('/:foo/test', function(req, next) {
        expect(req.params.foo).to.equal('bar');
        expect(req.test).to.equal(true);
        expect(called).to.equal(1);
        next();
      });

      router.route('/:foo/test', function(req) {
        expect(req.params.foo).to.equal('bar');
        expect(req.test).to.equal(true);
        expect(called).to.equal(1);
        done();
      });

      router.redirect('/bar/test');
    });

    it('should filter a url by regular expression', function(done) {
      var called = 0;

      router.param('userId', /^user-\d+$/);

      router.route('/users/:userId', function(req) {
        called++;
      });

      router.redirect('/users/12345');

      setTimeout(function() {
        router.redirect('/users/user-12345');
        setTimeout(function() {
          expect(called).to.equal(1);
          done();
        });
      }, 100);
    });
  });

});
