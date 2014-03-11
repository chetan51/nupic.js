function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function prod(nums) {
    return _.reduce(nums, function(p, n) { return p * n; });
}

function toArray(x) {
    return typeof x === 'number' ? [x] : x;
}
