describe('SpatialPooler', function() {

  describe('init', function() {

    it('should set up default params', function() {
        var sp = new SpatialPooler(),
            defaults = {
                inputDimensions: [32,32],
                columnDimensions: [64,64],
                potentialRadius: 16,
                potentialPct: 0.5,
                globalInhibition: false,
                localAreaDensity: -1.0,
                numActiveColumnsPerInhArea: 10.0,
                stimulusThreshold: 0,
                synPermInactiveDec: 0.01,
                synPermActiveInc: 0.1,
                synPermConnected: 0.10,
                minPctOverlapDutyCycle: 0.001,
                minPctActiveDutyCycle: 0.001,
                dutyCyclePeriod: 1000,
                maxBoost: 10.0,
                seed: -1,
                spVerbosity: 0
            },
            numColumns = prod(defaults.columnDimensions),
            numInputs = prod(defaults.inputDimensions),
            iterationNum = 0,
            iterationLearnNum = 0,
            updatePeriod = 50,
            synPermTrimThreshold = defaults.synPermActiveInc / 2.0,
            synPermBelowStimulusInc = defaults.synPermConnected / 10.0;
        
        sp.getNumColumns().should.equal(numColumns);
        sp.getNumInputs().should.equal(numInputs);
        sp.getPotentialRadius().should.equal(defaults.potentialRadius);
        sp.getPotentialPct().should.equal(defaults.potentialPct);
        sp.getGlobalInhibition().should.equal(defaults.globalInhibition);
        sp.getNumActiveColumnsPerInhArea().should.equal(defaults.numActiveColumnsPerInhArea);
        sp.getLocalAreaDensity().should.equal(defaults.localAreaDensity);
        sp.getStimulusThreshold().should.equal(defaults.stimulusThreshold);
        // sp.getInhibitionRadius().should.equal();
        sp.getDutyCyclePeriod().should.equal(defaults.dutyCyclePeriod);
        sp.getMaxBoost().should.equal(defaults.maxBoost);
        sp.getIterationNum().should.equal(iterationNum);
        sp.getIterationLearnNum().should.equal(iterationLearnNum);
        sp.getSpVerbosity().should.equal(defaults.spVerbosity);
        sp.getUpdatePeriod().should.equal(updatePeriod);
        sp.getSynPermTrimThreshold().should.equal(synPermTrimThreshold);
        sp.getSynPermActiveInc().should.equal(defaults.synPermActiveInc);
        sp.getSynPermInactiveDec().should.equal(defaults.synPermInactiveDec);
        sp.getSynPermBelowStimulusInc().should.equal(synPermBelowStimulusInc);
        sp.getSynPermConnected().should.equal(defaults.synPermConnected);
        sp.getMinPctOverlapDutyCycles().should.equal(defaults.minPctOverlapDutyCycle);
        sp.getMinPctActiveDutyCycles().should.equal(defaults.minPctActiveDutyCycle);
    });

    it('should allow overriding default params', function() {
        var sp = new SpatialPooler({ potentialPct: 0.3 });

        sp.getPotentialPct().should.equal(0.3);
    });

  });

});
