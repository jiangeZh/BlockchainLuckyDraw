var LCGRandom = {
    randArray: function(seed, number, array) {
        var results = new Array();
        if (number > array.length) {
            return array;
        }
        for (var i = 0; i < number; ++i) {
            seed = rnd(seed);
            var index = rndRange(seed, 0, array.length);
            results.push(array[index]);
            array.splice(index, 1);
        }
        return results;
    }
}

function rnd(seed) {
    seed = ( seed * 9301 + 49297 ) % 233280;
    return seed;
};

function rndRange(seed, min, max) {
    return seed%(max-min)+min; 
}

module.exports = LCGRandom;
