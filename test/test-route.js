var Route = require('../src/route');

describe('Route', function() {

  it('should match its own path', function() {
    var route = new Route('/foo/bar');
    expect(route.match('/foo/bar')).to.be.true;
  });

  it('should match its own path with a trailing slash', function() {
    var route = new Route('/foo/bar');
    expect(route.match('/foo/bar/')).to.be.true;
  });

  it('should match a path with parameters', function() {
    var route = new Route('/:foo/bar');
    expect(route.match('/anything/bar')).to.be.true;
  });

  it('should get the parameters of a path', function() {
    var route = new Route('/:foo/bar');
    expect(route.getParams('/anything/bar')).to.deep.equal({ foo: 'anything' });
  });

  it('should match a path with wildcards', function() {
    var route = new Route('/:foo/bar/*');
    expect(route.match('/anything/bar')).to.be.false;
    expect(route.match('/anything/bar/test')).to.be.true;
  });

  it('should get the parameters of a path with wildcards', function() {
    var route = new Route('/:foo/bar/*');
    expect(route.getParams('/anything/bar/test')).to.deep.equal({ foo: 'anything', '*': 'test' });
    expect(route.getParams('/anything/bar/test/stuff')).to.deep.equal({ foo: 'anything', '*': 'test/stuff' });
  });

  it('should call the callback when handled', function() {
    var called1 = false, called2 = false;
    var route = new Route('/:foo/bar', function(req, done) {
      called1 = true;
      done();
    });
    route.handle({}, function() {
      called2 = true;
    });
    expect(called1).to.be.true;
    expect(called2).to.be.true;
  });

  it('should set the params when handled', function() {
    var params = null;
    var route = new Route('/:foo/bar', function(req) {
      params = req.params;
    });

    route.match('/anything/bar');
    route.handle({});
    expect(params).to.deep.equal({ foo: 'anything' });
  });

});
