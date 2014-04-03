describe('SpatialPooler', function() {

    describe('init', function() {

        it('should set up default params', function() {
            var sp = new SpatialPooler(),
                defaults = {
                    inputDimensions: [16, 16],
                    columnDimensions: [8, 8],
                    potentialRadius: 4,
                    potentialPct: 0.5,
                    wrapAround: true,
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
                synPermBelowStimulusInc = defaults.synPermConnected / 10.0;
            
            sp.getNumColumns().should.equal(numColumns);
            sp.getNumInputs().should.equal(numInputs);
            sp.getPotentialRadius().should.equal(defaults.potentialRadius);
            sp.getPotentialPct().should.equal(defaults.potentialPct);
            sp.getWrapAround().should.equal(defaults.wrapAround);
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
                    wrapAround: false,
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
                    synPermBelowStimulusInc: 0.3
                };
            
            sp.setPotentialRadius(params.potentialRadius);
            sp.getPotentialRadius().should.equal(params.potentialRadius);

            sp.setPotentialPct(params.potentialPct);
            sp.getPotentialPct().should.equal(params.potentialPct);

            sp.setWrapAround(params.wrapAround);
            sp.getWrapAround().should.equal(params.wrapAround);

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

        it('should init potential', function() {
            var sp = new SpatialPooler({
                inputDimensions: [16, 16],
                columnDimensions: [8, 8],
                potentialRadius: 4,
                potentialPct: 0.5,
                wrapAround: true,
            });

            sp.getPotential(0).length.should.equal(40);
            sp.getPotential(63).length.should.equal(40);
            should.Throw(function() {
                sp.getPotential(64);
            }, "column out of bounds");
        });

        it('should init permanences', function() {
            seedRandom(0);

            var synPermConnected = 0.4,
                sp = new SpatialPooler({
                    inputDimensions: [16, 16],
                    columnDimensions: [8, 8],
                    potentialRadius: 4,
                    potentialPct: 0.5,
                    wrapAround: true,
                    synPermConnected: synPermConnected
                });

            sp.getPermanences(0).length.should.equal(40);
            sp.getPermanences(63).length.should.equal(40);
            should.Throw(function() {
                sp.getPermanences(64);
            }, "column out of bounds");

            var permanences = sp.getPermanences(0),
                maxPermanence = _.max(permanences),
                minPermanence = _.min(permanences);

            (maxPermanence - synPermConnected < 0.1).should.equal(true);
            (minPermanence - synPermConnected > -0.1).should.equal(true);
        });

        it('should init connected synapses', function() {
            seedRandom(0);

            var synPermConnected = 0.4,
                sp = new SpatialPooler({
                    inputDimensions: [16, 16],
                    columnDimensions: [8, 8],
                    potentialRadius: 4,
                    potentialPct: 0.5,
                    wrapAround: true,
                    synPermConnected: synPermConnected
                });

            sp.getConnectedSynapses(0).length.should.equal(18);
            sp.getConnectedSynapses(63).length.should.equal(20);
            should.Throw(function() {
                sp.getConnectedSynapses(64);
            }, "column out of bounds");
        });

    });

    describe('mapPotential', function() {

        describe('for 1-D columns and inputs', function() {
            var params = {
                    columnDimensions: 4,
                    inputDimensions: 10,
                    potentialRadius: 2
                },
                indices;

            it('should work without wrapAround and potentialPct = 1', function() {
                params.wrapAround = false;
                params.potentialPct = 1;
                var sp = new SpatialPooler(params);

                indices = sp._mapPotential(0);
                expectEqualSets(indices, [0, 1, 2]);

                indices = sp._mapPotential(2);
                expectEqualSets(indices, [4, 5, 6, 7, 8]);
            });

            it('should work with wrapAround and potentialPct = 1', function() {
                params.wrapAround = true;
                params.potentialPct = 1;
                var sp = new SpatialPooler(params);

                indices = sp._mapPotential(0);
                expectEqualSets(indices, [8, 9, 0, 1, 2]);
                
                indices = sp._mapPotential(3);
                expectEqualSets(indices, [7, 8, 9, 0, 1]);
            });

            it('should work with potentialPct < 1', function() {
                params.wrapAround = true;
                params.potentialPct = 0.5;
                var sp = new SpatialPooler(params);

                seedRandom(0);
                indices = sp._mapPotential(0);
                expectEqualSets(indices, [0, 9]);

                seedRandom(1);
                indices = sp._mapPotential(0);
                expectEqualSets(indices, [0, 2]);
            });

        });

        describe('for 2-D columns and inputs', function() {
            var params = {
                    columnDimensions: [2, 4],
                    inputDimensions: [5, 10],
                    potentialRadius: 1,
                    potentialPct: 1
                },
                indices;

            it('should work without wrapAround', function() {
                params.wrapAround = false;
                var sp = new SpatialPooler(params);

                indices = sp._mapPotential(0);
                expectEqualSets(indices, [0, 10,
                                          1, 11]);

                indices = sp._mapPotential(2);
                expectEqualSets(indices, [5, 15,
                                          6, 16,
                                          7, 17]);
            });

            it('should work with wrapAround', function() {
                params.wrapAround = true;
                var sp = new SpatialPooler(params);

                indices = sp._mapPotential(0);
                expectEqualSets(indices, [49, 9, 19,
                                          40, 0, 10,
                                          41, 1, 11]);
                
                indices = sp._mapPotential(3);
                expectEqualSets(indices, [48, 8, 18,
                                          49, 9, 19,
                                          40, 0, 10]);
            });

        });

        describe('for 2-D columns to 1-D inputs', function() {
            var params = {
                    columnDimensions: [2, 4],
                    inputDimensions: 10,
                    potentialRadius: 1,
                    potentialPct: 1
                },
                indices;

            it('should work without wrapAround', function() {
                params.wrapAround = false;
                var sp = new SpatialPooler(params);

                indices = sp._mapPotential(0);
                expectEqualSets(indices, [0, 1]);

                indices = sp._mapPotential(2);
                expectEqualSets(indices, [1, 2, 3]);
            });

            it('should work with wrapAround', function() {
                params.wrapAround = true;
                var sp = new SpatialPooler(params);

                indices = sp._mapPotential(0);
                expectEqualSets(indices, [9, 0, 1]);
                
                indices = sp._mapPotential(7);
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

    describe('initPermanences', function() {

        describe('should work for 1-D columns and inputs', function() {
            var params = {
                    columnDimensions: 3,
                    inputDimensions: 21,
                    potentialRadius: 8,
                    potentialPct: 1
                },
                potentialInputs = _.range(2, 18 + 1); // based on mapPotential

            it('should work with synPermConnected = 0.2', function() {
                params.synPermConnected = 0.2;
                var sp = new SpatialPooler(params),
                    permanences;

                seedRandom(2);
                permanences = [0.13711843022150286, 0.17286876390682743, 0.14731631584363575, 0.16895395054235182, 0.18155181438922602, 0.163404809647339, 0.18920165530499405, 0.21629304586051373, 0.29712180126639753, 0.2684074648744276, 0.22533613437057318, 0.21261444418221195, 0.1585177153438725, 0.1984282816584751, 0.221567889323608, 0.19869231826025469, 0.11176709048653086];
                sp._initPermanences(1, potentialInputs).should.eql(permanences);

                seedRandom(3);
                permanences = [0.17568531143538127, 0.17388858151827952, 0.22303335113014128, 0.22178552851633493, 0.2010314637049589, 0.21955289717232748, 0.2385676225739555, 0.19192169300275638, 0.28577493375272, 0.19959522627734758, 0.2672606258997287, 0.2405872213846217, 0.17049310408293167, 0.1523794682427948, 0.1645925257225792, 0.19940834802469937, 0.11972376166617457];
                sp._initPermanences(1, potentialInputs).should.eql(permanences);
            });

            it('should work with synPermConnected = 0.05', function() {
                params.synPermConnected = 0.05;
                var sp = new SpatialPooler(params),
                    permanences;

                seedRandom(4);
                permanences = [0, 0.058430501314847325, 0.05901566978890305, 0.08169275079418306, 0.026617600716573625, 0.06002019710206459, 0.08181170420810457, 0.059531356957450585, 0.05788645845833487, 0.11108921847515214, 0.0640552363710386, 0.08537930642487773, 0.07758013187668893, 0.07972202234311865, 0, 0.04878019810796887, 0];
                sp._initPermanences(1, potentialInputs).should.eql(permanences);

                seedRandom(5);
                permanences = [0.03975141500470744, 0, 0.07061847198954546, 0.0510995401315561, 0.08036316709207185, 0.0628020682287197, 0.08281056750334334, 0.10760512259466128, 0.13997566779004045, 0.061080177084957166, 0.09936062007762783, 0.04744733289817435, 0.013459834572290427, 0.06818079309672853, 0.06521898083726077, 0.03578137649917938, 0];
                sp._initPermanences(1, potentialInputs).should.eql(permanences);
            });

        });

        // TODO: add tests for 2-D columns and inputs

    });

    describe('computeInhibitionRadius', function() {
        seedRandom(0);

        describe('should work with global inhibition', function() {
            var params = {
                inputDimensions: [16, 16],
                columnDimensions: [8, 8],
                potentialRadius: 4,
                potentialPct: 0.5,
                wrapAround: true,
                globalInhibition: true
            };

            it('should work with synPermConnected = 0.4', function() {
                params.synPermConnected = 0.4;
                var sp = new SpatialPooler(params);

                sp._computeInhibitionRadius().should.equal(4);
            });

        });

        describe('should work with local inhibition', function() {
            var params = {
                inputDimensions: [16, 16],
                columnDimensions: [8, 8],
                potentialRadius: 4,
                potentialPct: 0.5,
                wrapAround: true,
                globalInhibition: false
            };

            it('should work with synPermConnected = 0.4', function() {
                params.synPermConnected = 0.4;
                var sp = new SpatialPooler(params);

                sp._computeInhibitionRadius().should.equal(0); // TODO: implement this
            });
            
        });

    });

});
