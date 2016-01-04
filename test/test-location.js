var PushLocation = require('../src/push-location');

describe('Location', function() {
  var location = new PushLocation();

  describe('getRelativeUrl', function() {

    it('should get a relative sibling URL', function() {
      location.currentUrl = '/test/foo/bar';
      expect(location.getRelativeUrl('thing')).to.equal('/test/foo/thing');
    });

    it('should get a relative parent URL', function() {
      location.currentUrl = '/test/foo/bar';
      expect(location.getRelativeUrl('../thing')).to.equal('/test/thing');
    });

    it('should get a relative root URL', function() {
      location.currentUrl = '/test/foo/bar';
      expect(location.getRelativeUrl('/thing?test')).to.equal('/thing?test');
    });

    it('should get an absolute URL', function() {
      location.currentUrl = '/test/foo/bar';
      expect(location.getRelativeUrl('http://example.com/thing')).to.equal('/thing');
    });

  });

  describe('_changeTo', function() {

    it('should dispatch changes', function() {
      var changedToURI = null;

      location.on('change', function(event) {
        changedToURI = event.detail.url;
      });

      location._changeTo('/test/foo/bar');

      expect(changedToURI).to.equal('/test/foo/bar');
    });

  });

});
