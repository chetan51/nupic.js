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
                    spVerbosity: 0
                },
                numColumns = Arr.prod(defaults.columnDimensions),
                numInputs = Arr.prod(defaults.inputDimensions),
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
            var sp = new SpatialPooler({
                potentialPct: 0.3
            });

            sp.getPotentialPct().should.equal(0.3);
        });

        it('should allow integer input / column dimensions', function() {
            var sp = new SpatialPooler({
                inputDimensions: 10,
                columnDimensions: 20
            });
            
            sp.getNumInputs().should.equal(10);
            sp.getNumColumns().should.equal(20);
        });

        it('should allow setting and setting params', function() {
            var sp = new SpatialPooler(),
                params = {
                    potentialRadius: 8,
                    potentialPct: 0.25,
                    globalInhibition: true,
                    localAreaDensity: 0.2,
                    numActiveColumnsPerInhArea: 15.0,
                    stimulusThreshold: 0.5,
                    inhibitionRadius: 0.1,
                    synPermInactiveDec: 0.2,
                    synPermActiveInc: 0.2,
                    synPermConnected: 0.20,
                    minPctOverlapDutyCycle: 0.002,
                    minPctActiveDutyCycle: 0.002,
                    dutyCyclePeriod: 2000,
                    maxBoost: 20.0,
                    spVerbosity: 1,
                    iterationNum: 1,
                    iterationLearnNum: 2,
                    updatePeriod: 10,
                    synPermTrimThreshold: 0.2,
                    synPermBelowStimulusInc: 0.3
                };
            
            sp.setPotentialRadius(params.potentialRadius);
            sp.getPotentialRadius().should.equal(params.potentialRadius);

            sp.setPotentialPct(params.potentialPct);
            sp.getPotentialPct().should.equal(params.potentialPct);

            sp.setGlobalInhibition(params.globalInhibition);
            sp.getGlobalInhibition().should.equal(params.globalInhibition);

            sp.setNumActiveColumnsPerInhArea(params.numActiveColumnsPerInhArea);
            sp.getNumActiveColumnsPerInhArea().should.equal(params.numActiveColumnsPerInhArea);

            sp.setLocalAreaDensity(params.localAreaDensity);
            sp.getLocalAreaDensity().should.equal(params.localAreaDensity);

            sp.setStimulusThreshold(params.stimulusThreshold);
            sp.getStimulusThreshold().should.equal(params.stimulusThreshold);

            sp.setInhibitionRadius(params.inhibitionRadius);
            sp.getInhibitionRadius().should.equal(params.inhibitionRadius);

            sp.setDutyCyclePeriod(params.dutyCyclePeriod);
            sp.getDutyCyclePeriod().should.equal(params.dutyCyclePeriod);

            sp.setMaxBoost(params.maxBoost);
            sp.getMaxBoost().should.equal(params.maxBoost);

            sp.setIterationNum(params.iterationNum);
            sp.getIterationNum().should.equal(params.iterationNum);

            sp.setIterationLearnNum(params.iterationLearnNum);
            sp.getIterationLearnNum().should.equal(params.iterationLearnNum);

            sp.setSpVerbosity(params.spVerbosity);
            sp.getSpVerbosity().should.equal(params.spVerbosity);

            sp.setUpdatePeriod(params.updatePeriod);
            sp.getUpdatePeriod().should.equal(params.updatePeriod);

            sp.setSynPermTrimThreshold(params.synPermTrimThreshold);
            sp.getSynPermTrimThreshold().should.equal(params.synPermTrimThreshold);

            sp.setSynPermActiveInc(params.synPermActiveInc);
            sp.getSynPermActiveInc().should.equal(params.synPermActiveInc);

            sp.setSynPermInactiveDec(params.synPermInactiveDec);
            sp.getSynPermInactiveDec().should.equal(params.synPermInactiveDec);

            sp.setSynPermBelowStimulusInc(params.synPermBelowStimulusInc);
            sp.getSynPermBelowStimulusInc().should.equal(params.synPermBelowStimulusInc);

            sp.setSynPermConnected(params.synPermConnected);
            sp.getSynPermConnected().should.equal(params.synPermConnected);

            sp.setMinPctOverlapDutyCycles(params.minPctOverlapDutyCycle);
            sp.getMinPctOverlapDutyCycles().should.equal(params.minPctOverlapDutyCycle);

            sp.setMinPctActiveDutyCycles(params.minPctActiveDutyCycle);
            sp.getMinPctActiveDutyCycles().should.equal(params.minPctActiveDutyCycle);
        });

    });

    describe('mapPotential', function() {

        describe('for 1-D columns and inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: 4,
                    inputDimensions: 10,
                    potentialRadius: 2,
                    potentialPct: 1
                }),
                indices;

            it('should work without wrapAround', function() {
                indices = sp._mapPotential(0, false);
                expectEqualSets(indices, [0, 1, 2]);

                indices = sp._mapPotential(2, false);
                expectEqualSets(indices, [4, 5, 6, 7, 8]);
            });

            it('should work with wrapAround', function() {
                indices = sp._mapPotential(0, true);
                expectEqualSets(indices, [8, 9, 0, 1, 2]);
                
                indices = sp._mapPotential(3, true);
                expectEqualSets(indices, [7, 8, 9, 0, 1]);
            });

            it('should work with potentialPct < 1', function() {
                sp = new SpatialPooler({
                    columnDimensions: 4,
                    inputDimensions: 10,
                    potentialRadius: 2,
                    potentialPct: 0.5
                });

                indices = sp._mapPotential(0, true);
                expectEqualSets(indices, [0, 1]); // random seeded
            });

        });

        describe('for 2-D columns and inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: [2, 4],
                    inputDimensions: [5, 10],
                    potentialRadius: 1,
                    potentialPct: 1
                }),
                indices;

            it('should work without wrapAround', function() {
                indices = sp._mapPotential(0, false);
                expectEqualSets(indices, [0, 10,
                                    1, 11]);

                indices = sp._mapPotential(2, false);
                expectEqualSets(indices, [5, 15,
                                    6, 16,
                                    7, 17]);
            });

            it('should work with wrapAround', function() {
                indices = sp._mapPotential(0, true);
                expectEqualSets(indices, [49, 9, 19,
                                    40, 0, 10,
                                    41, 1, 11]);
                
                indices = sp._mapPotential(3, true);
                expectEqualSets(indices, [48, 8, 18,
                                    49, 9, 19,
                                    40, 0, 10]);
            });

        });

        describe('for 2-D columns to 1-D inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: [2, 4],
                    inputDimensions: 10,
                    potentialRadius: 1,
                    potentialPct: 1
                }),
                indices;

            it('should work without wrapAround', function() {
                indices = sp._mapPotential(0, false);
                expectEqualSets(indices, [0, 1]);

                indices = sp._mapPotential(2, false);
                expectEqualSets(indices, [1, 2, 3]);
            });

            it('should work with wrapAround', function() {
                indices = sp._mapPotential(0, true);
                expectEqualSets(indices, [9, 0, 1]);
                
                indices = sp._mapPotential(7, true);
                expectEqualSets(indices, [8, 9, 0]);
            });

        });

    });

    describe('mapColumn', function() {

        it('should work for 1D columns to 1D inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: 4,
                    inputDimensions: 10
                });

            sp._mapColumn(0).should.equal(0);
            sp._mapColumn(1).should.equal(3);
            sp._mapColumn(2).should.equal(6);
            sp._mapColumn(3).should.equal(9);
        });

        it('should work for 1D columns to 1D inputs of the same dimensions', function() {
            var sp = new SpatialPooler({
                    columnDimensions: 4,
                    inputDimensions: 4
                });

            sp._mapColumn(0).should.equal(0);
            sp._mapColumn(1).should.equal(1);
            sp._mapColumn(2).should.equal(2);
            sp._mapColumn(3).should.equal(3);
        });

        it('should work for 2D columns to 2D inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: [12, 4],
                    inputDimensions: [20, 10]
                });

            sp._mapColumn(0).should.equal(0);
            sp._mapColumn(4).should.equal(10);
            sp._mapColumn(5).should.equal(13);
            sp._mapColumn(7).should.equal(19);
            sp._mapColumn(47).should.equal(199);
        });

        it('should work for 3D columns to 2D inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: [12, 2, 2],
                    inputDimensions: [20, 10]
                });

            sp._mapColumn(0).should.equal(0);
            sp._mapColumn(4).should.equal(10);
            sp._mapColumn(5).should.equal(13);
            sp._mapColumn(7).should.equal(19);
            sp._mapColumn(47).should.equal(199);
        });

        it('should work for 2D columns to 3D inputs', function() {
            var sp = new SpatialPooler({
                    columnDimensions: [12, 4],
                    inputDimensions: [20, 5, 2]
                });

            sp._mapColumn(0).should.equal(0);
            sp._mapColumn(4).should.equal(10);
            sp._mapColumn(5).should.equal(13);
            sp._mapColumn(7).should.equal(19);
            sp._mapColumn(47).should.equal(199);
        });

    });

});
