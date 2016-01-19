var router = require('../src/router');
var PushLocation = require('../src/push-location');

describe('PushLocation', function() {
  var location = new PushLocation();


  describe('path', function() {

    it('should return the initial page by default', function() {
      expect(location.url).to.equal(window.location.pathname);
    });

    it('should set the url when the path is changed', function() {
      location.url = '/foo/bar';
      expect(window.location.pathname).to.equal('/foo/bar');
    });

    it('should dispatch a change event when the path changes', function(done) {
      var changedPath = null;
      location.url = '/foo/bar';
      location.one('change', function(event) {
        changedPath = event.detail.url;
      });
      location.url = '/foo/bar/test';
      setTimeout(function() {
        expect(changedPath).to.equal('/foo/bar/test');
        done();
      }, 100);
    });

    it('should dispatch a change event when the browser goes back a page', function(done) {
      var changedPath = null;
      location.url = '/foo/bar';
      location.url = '/foo/bar/test';
      location.one('change', function(event) {
        changedPath = event.detail.url;
      });
      history.back();
      setTimeout(function() {
        expect(changedPath).to.equal('/foo/bar');
        done();
      }, 100);
    });

    it('should NOT dispatch a change event when the path is set to the same thing', function(done) {
      var changedPath = null;
      location.url = '/foo/bar';
      location.one('change', function(event) {
        changedPath = event.detail.url;
      });
      location.url = '/foo/bar';
      setTimeout(function() {
        expect(changedPath).to.equal(null);
        done();
      }, 100);
    });

  });

});
