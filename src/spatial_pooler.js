/*
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
        columnDimensions: (64,64),
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
    seed:                 Seed for our own pseudo-random number generator.
    spVerbosity:          spVerbosity level: 0, 1, 2, or 3
    */

    // Override default params
    params = params || {};
    _.defaults(params, defaults);

    // Save arguments
    this._potentialPct = params.potentialPct;
};

SpatialPooler.prototype.getPotentialPct = function() {
  return this._potentialPct;
};
