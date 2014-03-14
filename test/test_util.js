function expectEqualSets(a, b) {
    a.sort().should.eql(b.sort());
}
