var router = require('../src/router');
var HashLocation = require('../src/hash-location');

describe('HashLocation', function() {
  var location = new HashLocation();

  describe('path', function() {

    it('should return "/" by default', function() {
      expect(location.url).to.equal('/');
    });

    it('should set the hash when the path is changed', function() {
      location.url = '/foo/bar';
      expect(window.location.hash).to.equal('#/foo/bar');
    });

    it('should remove the hash when the path is changed to "/"', function() {
      location.url = '/foo/bar';
      expect(window.location.hash).to.not.equal('');
      location.url = '/';
      expect(window.location.hash).to.equal('');
    });

    it('should dispatch a change event when the path changes', function(done) {
      var changedUrl = null;
      location.url = '/foo/bar';
      location.one('change', function(event) {
        changedUrl = event.detail.url;
      });
      location.url = '/foo/bar/test';
      setTimeout(function() {
        expect(changedUrl).to.equal('/foo/bar/test');
        done();
      }, 100);
    });

    it('should dispatch a change event when the browser goes back a page', function(done) {
      var changedUrl = null;
      location.url = '/foo/bar';
      location.url = '/foo/bar/test';
      location.one('change', function(event) {
        changedUrl = event.detail.url;
      });
      history.back();
      setTimeout(function() {
        expect(changedUrl).to.equal('/foo/bar');
        done();
      }, 100);
    });

    it('should NOT dispatch a change event when the path is set to the same thing', function(done) {
      var changedUrl = null;
      location.url = '/foo/bar';
      location.one('change', function(event) {
        changedUrl = event.detail.url;
      });
      location.url = '/foo/bar';
      setTimeout(function() {
        expect(changedUrl).to.equal(null);
        done();
      }, 100);
    });

  });

});
