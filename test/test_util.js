function expectEqualSets(a, b) {
    a.sort().should.eql(b.sort());
}

currentRandomSeed = 0;

function reseedRandom() {
    Math.seedrandom(currentRandomSeed++);
    _ = _.runInContext();
}
