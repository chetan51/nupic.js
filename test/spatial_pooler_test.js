describe('SpatialPooler', function() {

  describe('init', function() {

    it('should set up default params', function() {
        var sp = new SpatialPooler();
        
        sp.getPotentialPct().should.equal(0.5);
    });

    it('should allow overriding default params', function() {
        var sp = new SpatialPooler({ potentialPct: 0.3 });

        sp.getPotentialPct().should.equal(0.3);
    });

  });

});
