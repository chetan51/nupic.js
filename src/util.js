function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function toArray(x) {
    return typeof x === 'number' ? [x] : x;
}
