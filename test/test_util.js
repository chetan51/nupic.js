function expectEqualSets(a, b) {
    a.sort().should.eql(b.sort());
}

function seedRandom(seed) {
    Math.seedrandom(seed);
    _ = _.runInContext();
}
