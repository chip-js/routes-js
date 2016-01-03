var PushLocation = require('../src/push-location');

describe('Location', function() {
  var location = new PushLocation();

  describe('getRelativePath', function() {

    it('should get a relative sibling URL', function() {
      expect(location.getRelativePath('/test/foo/bar', 'thing')).to.equal('/test/foo/thing');
    });

    it('should get a relative parent URL', function() {
      expect(location.getRelativePath('/test/foo/bar', '../thing')).to.equal('/test/thing');
    });

    it('should get a relative root URL', function() {
      expect(location.getRelativePath('/test/foo/bar', '/thing')).to.equal('/thing');
    });

    it('should get an absolute URL', function() {
      expect(location.getRelativePath('/test/foo/bar', 'http://example.com/thing')).to.equal('/thing');
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
