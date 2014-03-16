/*
 * @author Chetan Surpur <csurpur@numenta.com>
# ----------------------------------------------------------------------
# Numenta Platform for Intelligent Computing (NuPIC)
# Copyright (C) 2014, Numenta, Inc.  Unless you have an agreement
# with Numenta, Inc., for a separate license for this software code, the
# following terms and conditions apply:
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see http://www.gnu.org/licenses.
#
# http://numenta.org/licenses/
# ----------------------------------------------------------------------
*/

/*
  This class implements the spatial pooler. It is in charge of handling the
  relationships between the columns of a region and the inputs bits. The
  primary public interface to this function is the "compute" method, which
  takes in an input vector and returns a list of activeColumns columns.
  Example Usage:
  >
  > sp = SpatialPooler(...)
  > for line in file:
  >   inputVector = numpy.array(line)
  >   sp.compute(inputVector)
  >   ...
*/
var SpatialPooler = function(params) {
    var defaults = {
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
        synPermConnected: 0.1,
        minPctOverlapDutyCycle: 0.001,
        minPctActiveDutyCycle: 0.001,
        dutyCyclePeriod: 1000,
        maxBoost: 10.0,
        spVerbosity: 0
    };
    /*
    Parameters:
    ----------------------------
    inputDimensions:      A list representing the dimensions of the input
                          vector. Format is [height, width, depth, ...], where
                          each value represents the size of the dimension. For a
                          topology of one dimesion with 100 inputs use 100, or
                          [100]. For a two dimensional topology of 10x5 use
                          [10,5].
    columnDimensions:     A list representing the dimensions of the columns in
                          the region. Format is [height, width, depth, ...],
                          where each value represents the size of the dimension.
                          For a topology of one dimesion with 2000 columns use
                          2000, or [2000]. For a three dimensional topology of
                          32x64x16 use [32, 64, 16].
    potentialRadius:      This parameter deteremines the extent of the input
                          that each column can potentially be connected to.
                          This can be thought of as the input bits that
                          are visible to each column, or a 'receptiveField' of
                          the field of vision. A large enough value will result
                          in 'global coverage', meaning that each column
                          can potentially be connected to every input bit. This
                          parameter defines a square (or hyper square) area: a
                          column will have a max square potential pool with
                          sides of length 2 * potentialRadius + 1.
    potentialPct:         The percent of the inputs, within a column's
                          potential radius, that a column can be connected to.
                          If set to 1, the column will be connected to every
                          input within its potential radius. This parameter is
                          used to give each column a unique potential pool when
                          a large potentialRadius causes overlap between the
                          columns. At initialization time we choose
                          ((2*potentialRadius + 1)^(# inputDimensions) *
                          potentialPct) input bits to comprise the column's
                          potential pool.
    globalInhibition:     If true, then during inhibition phase the winning
                          columns are selected as the most active columns from
                          the region as a whole. Otherwise, the winning columns
                          are selected with respect to their local
                          neighborhoods. Using global inhibition boosts
                          performance x60.
    localAreaDensity:     The desired density of active columns within a local
                          inhibition area (the size of which is set by the
                          internally calculated inhibitionRadius, which is in
                          turn determined from the average size of the
                          connected potential pools of all columns). The
                          inhibition logic will insure that at most N columns
                          remain ON within a local inhibition area, where N =
                          localAreaDensity * (total number of columns in
                          inhibition area).
    numActivePerInhArea:  An alternate way to control the density of the active
                          columns. If numActivePerInhArea is specified then
                          localAreaDensity must less than 0, and vice versa.
                          When using numActivePerInhArea, the inhibition logic
                          will insure that at most 'numActivePerInhArea'
                          columns remain ON within a local inhibition area (the
                          size of which is set by the internally calculated
                          inhibitionRadius, which is in turn determined from
                          the average size of the connected receptive fields of
                          all columns). When using this method, as columns
                          learn and grow their effective receptive fields, the
                          inhibitionRadius will grow, and hence the net density
                          of the active columns will *decrease*. This is in
                          contrast to the localAreaDensity method, which keeps
                          the density of active columns the same regardless of
                          the size of their receptive fields.
    stimulusThreshold:    This is a number specifying the minimum number of
                          synapses that must be on in order for a columns to
                          turn ON. The purpose of this is to prevent noise
                          input from activating columns. Specified as a percent
                          of a fully grown synapse.
    synPermInactiveDec:   The amount by which an inactive synapse is
                          decremented in each round. Specified as a percent of
                          a fully grown synapse.
    synPermActiveInc:     The amount by which an active synapse is incremented
                          in each round. Specified as a percent of a
                          fully grown synapse.
    synPermConnected:     The default connected threshold. Any synapse whose
                          permanence value is above the connected threshold is
                          a "connected synapse", meaning it can contribute to
                          the cell's firing.
    minPctOvlerapDutyCycle: A number between 0 and 1.0, used to set a floor on
                          how often a column should have at least
                          stimulusThreshold active inputs. Periodically, each
                          column looks at the overlap duty cycle of
                          all other column within its inhibition radius and
                          sets its own internal minimal acceptable duty cycle
                          to: minPctDutyCycleBeforeInh * max(other columns'
                          duty cycles).
                          On each iteration, any column whose overlap duty
                          cycle falls below this computed value will  get
                          all of its permanence values boosted up by
                          synPermActiveInc. Raising all permanences in response
                          to a sub-par duty cycle before  inhibition allows a
                          cell to search for new inputs when either its
                          previously learned inputs are no longer ever active,
                          or when the vast majority of them have been
                          "hijacked" by other columns.
    minPctActiveDutyCycle: A number between 0 and 1.0, used to set a floor on
                          how often a column should be activate.
                          Periodically, each column looks at the activity duty
                          cycle of all other columns within its inhibition
                          radius and sets its own internal minimal acceptable
                          duty cycle to:
                            minPctDutyCycleAfterInh *
                            max(other columns' duty cycles).
                          On each iteration, any column whose duty cycle after
                          inhibition falls below this computed value will get
                          its internal boost factor increased.
    dutyCyclePeriod:      The period used to calculate duty cycles. Higher
                          values make it take longer to respond to changes in
                          boost or synPerConnectedCell. Shorter values make it
                          more unstable and likely to oscillate.
     maxBoost:            The maximum overlap boost factor. Each column's
                          overlap gets multiplied by a boost factor
                          before it gets considered for inhibition.
                          The actual boost factor for a column is number
                          between 1.0 and maxBoost. A boost factor of 1.0 is
                          used if the duty cycle is >= minOverlapDutyCycle,
                          maxBoost is used if the duty cycle is 0, and any duty
                          cycle in between is linearly extrapolated from these
                          2 endpoints.
    spVerbosity:          spVerbosity level: 0, 1, 2, or 3
    */

    // Override default params
    params = params || {};
    _.defaults(params, defaults);

    // Verify input is valid
    var columnDimensions = toArray(params.columnDimensions),
        inputDimensions = toArray(params.inputDimensions),
        numColumns = Arr.prod(columnDimensions),
        numInputs = Arr.prod(inputDimensions);

    assert(numColumns > 0, "numColumns should be greater than 0");
    assert(numInputs > 0, "numInputs should be greater than 0");
    assert(params.numActiveColumnsPerInhArea > 0 ||
           (params.localAreaDensity > 0 && params.localAreaDensity <= 0.5),
           "numActiveColumnsPerInhArea should be greater than 0 or " +
           "(localAreaDensity should be greater than 0 and localAreaDensity " +
           "should be less than or equal to 0.5)");

    // Save arguments
    this._numInputs = numInputs;
    this._numColumns = numColumns;
    this._columnDimensions = columnDimensions;
    this._inputDimensions = inputDimensions;
    this._potentialRadius = Math.min(params.potentialRadius, numInputs);
    this._potentialPct = params.potentialPct;
    this._globalInhibition = params.globalInhibition;
    this._numActiveColumnsPerInhArea = params.numActiveColumnsPerInhArea;
    this._localAreaDensity = params.localAreaDensity;
    this._stimulusThreshold = params.stimulusThreshold;
    this._synPermInactiveDec = params.synPermInactiveDec;
    this._synPermActiveInc = params.synPermActiveInc;
    this._synPermBelowStimulusInc = params.synPermConnected / 10.0;
    this._synPermConnected = params.synPermConnected;
    this._minPctOverlapDutyCycles = params.minPctOverlapDutyCycle;
    this._minPctActiveDutyCycles = params.minPctActiveDutyCycle;
    this._dutyCyclePeriod = params.dutyCyclePeriod;
    this._maxBoost = params.maxBoost;
    this._spVerbosity = params.spVerbosity;

    // Extra parameter settings
    this._synPermMin = 0.0;
    this._synPermMax = 1.0;
    this._synPermTrimThreshold = this._synPermActiveInc / 2.0;
    assert(this._synPermTrimThreshold < this._synPermConnected,
           "synPermTrimThreshold should be less than synPermConnected");
    this._updatePeriod = 50;

    // Internal state
    this._version = 1.0;
    this._iterationNum = 0;
    this._iterationLearnNum = 0;
};

SpatialPooler.prototype.getNumColumns = function() {
    /* Returns the total number of columns */
    return this._numColumns;
};

SpatialPooler.prototype.getNumInputs = function() {
    /* Returns the total number of inputs */
    return this._numInputs;
};

SpatialPooler.prototype.getPotentialRadius = function() {
    /* Returns the potential radius */
    return this._potentialRadius;
};

SpatialPooler.prototype.setPotentialRadius = function(potentialRadius) {
    /* Sets the potential radius */
    this._potentialRadius = potentialRadius;
};

SpatialPooler.prototype.getPotentialPct = function() {
    /* Returns the potential percent */
    return this._potentialPct;
};

SpatialPooler.prototype.setPotentialPct = function(potentialPct) {
    /* Sets the potential percent */
    this._potentialPct = potentialPct;
};

SpatialPooler.prototype.getGlobalInhibition = function() {
    /* Returns whether global inhibition is enabled */
    return this._globalInhibition;
};

SpatialPooler.prototype.setGlobalInhibition = function(globalInhibition) {
    /* Sets global inhibition */
    this._globalInhibition = globalInhibition;
};

SpatialPooler.prototype.getNumActiveColumnsPerInhArea = function() {
    /* Returns the number of active columns per inhibition area. Returns a
    value less than 0 if parameter is unused */
    return this._numActiveColumnsPerInhArea;
};

SpatialPooler.prototype.setNumActiveColumnsPerInhArea = function(numActiveColumnsPerInhArea) {
    /* Sets the number of active columns per inhibition area. Invalidates the
    'localAreaDensity' parameter */
    assert(numActiveColumnsPerInhArea > 0,
           "numActiveColumnsPerInhArea should be greater than 0");
    this._numActiveColumnsPerInhArea = numActiveColumnsPerInhArea;
    this._localAreaDensity = 0;
};

SpatialPooler.prototype.getLocalAreaDensity = function() {
    /* Returns the local area density. Returns a value less than 0 if parameter
    is unused */
    return this._localAreaDensity;
};

SpatialPooler.prototype.setLocalAreaDensity = function(localAreaDensity) {
    /* Sets the local area density. Invalidates the 'numActivePerInhArea'
    parameter */
    assert(localAreaDensity > 0 && localAreaDensity <= 1,
           "localAreaDensity should be greater than 0 or " +
           "localAreaDensity should be less than or equal to 1");
    this._localAreaDensity = localAreaDensity;
    this._numActiveColumnsPerInhArea = 0;
};

SpatialPooler.prototype.getStimulusThreshold = function() {
    /* Returns the stimulus threshold */
    return this._stimulusThreshold;
};

SpatialPooler.prototype.setStimulusThreshold = function(stimulusThreshold) {
    /* Sets the stimulus threshold */
    this._stimulusThreshold = stimulusThreshold;
};

SpatialPooler.prototype.getInhibitionRadius = function() {
    /* Returns the inhibition radius */
    return this._inhibitionRadius;
};

SpatialPooler.prototype.setInhibitionRadius = function(inhibitionRadius) {
    /* Sets the inhibition radius */
    this._inhibitionRadius = inhibitionRadius;
};

SpatialPooler.prototype.getDutyCyclePeriod = function() {
    /* Returns the duty cycle period */
    return this._dutyCyclePeriod;
};

SpatialPooler.prototype.setDutyCyclePeriod = function(dutyCyclePeriod) {
    /* Sets the duty cycle period */
    this._dutyCyclePeriod = dutyCyclePeriod;
};

SpatialPooler.prototype.getMaxBoost = function() {
    /* Returns the maximum boost value */
    return this._maxBoost;
};

SpatialPooler.prototype.setMaxBoost = function(maxBoost) {
    /* Sets the maximum boost value */
    this._maxBoost = maxBoost;
};

SpatialPooler.prototype.getIterationNum = function() {
    /* Returns the iteration number */
    return this._iterationNum;
};

SpatialPooler.prototype.setIterationNum = function(iterationNum) {
    /* Sets the iteration number */
    this._iterationNum = iterationNum;
};

SpatialPooler.prototype.getIterationLearnNum = function() {
    /* Returns the learning iteration number */
    return this._iterationLearnNum;
};

SpatialPooler.prototype.setIterationLearnNum = function(iterationLearnNum) {
    /* Sets the learning iteration number */
    this._iterationLearnNum = iterationLearnNum;
};

SpatialPooler.prototype.getSpVerbosity = function() {
    /* Returns the verbosity level */
    return this._spVerbosity;
};

SpatialPooler.prototype.setSpVerbosity = function(spVerbosity) {
    /* Sets the verbosity level */
    this._spVerbosity = spVerbosity;
};

SpatialPooler.prototype.getUpdatePeriod = function() {
    /* Returns the update period */
    return this._updatePeriod;
};

SpatialPooler.prototype.setUpdatePeriod = function(updatePeriod) {
    /* Sets the update period */
    this._updatePeriod = updatePeriod;
};

SpatialPooler.prototype.getSynPermTrimThreshold = function() {
    /* Returns the permanence trim threshold */
    return this._synPermTrimThreshold;
};

SpatialPooler.prototype.setSynPermTrimThreshold = function(synPermTrimThreshold) {
    /* Sets the permanence trim threshold */
    this._synPermTrimThreshold = synPermTrimThreshold;
};

SpatialPooler.prototype.getSynPermActiveInc = function() {
    /* Returns the permanence increment amount for active synapses
    inputs */
    return this._synPermActiveInc;
};

SpatialPooler.prototype.setSynPermActiveInc = function(synPermActiveInc) {
    /* Sets the permanence increment amount for active synapses */
    this._synPermActiveInc = synPermActiveInc;
};

SpatialPooler.prototype.getSynPermInactiveDec = function() {
    /* Returns the permanence decrement amount for inactive synapses */
    return this._synPermInactiveDec;
};

SpatialPooler.prototype.setSynPermInactiveDec = function(synPermInactiveDec) {
    /* Sets the permanence decrement amount for inactive synapses */
    this._synPermInactiveDec = synPermInactiveDec;
};

SpatialPooler.prototype.getSynPermBelowStimulusInc = function() {
    /* Returns the permanence increment amount for columns that have not been
    recently active  */
    return this._synPermBelowStimulusInc;
};

SpatialPooler.prototype.setSynPermBelowStimulusInc = function(synPermBelowStimulusInc) {
    /* Sets the permanence increment amount for columns that have not been
    recently active  */
    this._synPermBelowStimulusInc = synPermBelowStimulusInc;
};

SpatialPooler.prototype.getSynPermConnected = function() {
    /* Returns the permanence amount that qualifies a synapse as
    being connected */
    return this._synPermConnected;
};

SpatialPooler.prototype.setSynPermConnected = function(synPermConnected) {
    /* Sets the permanence amount that qualifies a synapse as being
    connected */
    this._synPermConnected = synPermConnected;
};

SpatialPooler.prototype.getMinPctOverlapDutyCycles = function() {
    /* Returns the minimum tolerated overlaps, given as percent of
    neighbors overlap score */
    return this._minPctOverlapDutyCycles;
};

SpatialPooler.prototype.setMinPctOverlapDutyCycles = function(minPctOverlapDutyCycles) {
    /* Sets the minimum tolerated activity duty cycle, given as percent of
    neighbors' activity duty cycle */
    this._minPctOverlapDutyCycles = minPctOverlapDutyCycles;
};

SpatialPooler.prototype.getMinPctActiveDutyCycles = function() {
    /* Returns the minimum tolerated activity duty cycle, given as percent of
    neighbors' activity duty cycle */
    return this._minPctActiveDutyCycles;
};

SpatialPooler.prototype.setMinPctActiveDutyCycles = function(minPctActiveDutyCycles) {
    /* Sets the minimum tolerated activity duty, given as percent of
    neighbors' activity duty cycle */
    this._minPctActiveDutyCycles = minPctActiveDutyCycles;
};

SpatialPooler.prototype._mapPotential = function(column, wrapAround) {
    wrapAround = wrapAround || false;
    /*
    Maps a column to its input bits. This method encapsultes the topology of
    the region. It takes the index of the column as an argument and determines
    what are the indices of the input vector that are located within the
    column's potential pool. The return value is a list containing the indices
    of the input bits. Examples of the expected output of this method:
    * If the potentialRadius is greater than or equal to the entire input
      space, (global visibility), then this method returns an array filled with
      all the indices
    * If the topology is one dimensional, and the potentialRadius is 5, this
      method will return an array containing 5 consecutive values centered on
      the index of the column (wrapping around if necessary).
    * If the topology is two dimensional, and the potentialRadius is 5, the
      method should return an array containing 25 indices, which are to be
      determined by the mapping from 1-D index to 2-D position.

    Parameters:
    ----------------------------
    column:         The index identifying a column in the permanence, potential
                    and connectivity matrices.
    wrapAround:     A boolean value indicating that boundaries should be
                    region boundaries ignored.
    */
    var input = this._mapColumn(column),
        indices = Arr.neighbors(input, this._potentialRadius, this._inputDimensions, wrapAround),
        numIndices = Math.floor(this._potentialPct * indices.length),
        sampledIndices = _.sample(indices, numIndices);

    return sampledIndices;
};

SpatialPooler.prototype._mapColumn = function(column) {
    /*
    Maps a column to its respective input index, keeping to the topology of
    the region. It takes the index of the column as an argument and determines
    what is the index of the flattened input vector that is to be the center of
    the column's potential pool. It distributes the columns over the inputs
    uniformly. The return value is an integer representing the index of the
    input bit. Examples of the expected output of this method:
    * If the topology is one dimensional, and the column index is 0, this
      method will return the input index 0. If the column index is 1, and there
      are 3 columns over 7 inputs, this method will return the input index 3.
    * If the topology is two dimensional, with column dimensions [3, 5] and
      input dimensions [7, 11], and the column index is 3, the method
      returns input index 8.

    Parameters:
    ----------------------------
    column:         The index identifying a column in the permanence, potential
                    and connectivity matrices.
    */

    var columnDimensions = this._columnDimensions,
        inputDimensions = this._inputDimensions,
        minNumDimensions = Math.min(columnDimensions.length, inputDimensions.length),
        normColumnDimensions = Arr.reduceDimensions(columnDimensions, minNumDimensions),
        normInputDimensions = Arr.reduceDimensions(inputDimensions, minNumDimensions),
        columnPoint = Arr.indexToPoint(column, normColumnDimensions),
        ratios = _.map(columnPoint, function(p, i) {
          return p / (normColumnDimensions[i] - 1);
        });
        inputPoint = _.map(normInputDimensions, function(p, i) {
          return Math.floor((p - 1) * ratios[i]);
        });

    return Arr.pointToIndex(inputPoint, normInputDimensions);
};
