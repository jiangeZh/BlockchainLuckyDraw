var EntropyCollector = require('./entropyCollector.js');
var Murmurhash3 = require('./MurmurHash3.js');

var UnconformedTxsRandom = {
    randInt: function(min, max) {
        var bytes = new Buffer(randbytes(4));
        var randNum = bytes.readUInt32BE(0);
        return (randNum%(max-min) + min);
    },

    randIntArray: function(number, array) {
        var results = new Array();
        if (number > array.length) {
            return array;
        }
        for (var i = 0; i < number; ++i) {
            var index = this.randInt(0, array.length);
            results.push(array[index]);
            array.splice(index, 1);
        }
        return results;
    }
}

function randbytes(num_bytes) {
    /*
     * Returns a bytearray of random bytes from the cache.
     * Like /dev/urandom, previously captured entropy is re-used so that
     * the thread will not block.
     */

    if (num_bytes < 1) {
        return null;
    }

    var bytes = new Array();
    var block = new Array();
    while (bytes.length < num_bytes) {
        var item = EntropyCollector.getItemFromQueue();
        if (item != -1) {
            block.push(item);
        }
        else {
            var reuse = true;
            for (var i = 0; i < 4; ++i) {
                item = EntropyCollector.getItemFromSpareQueue();
                if (item != -1) {
                    block.push(item);
                }
                else {
                    reuse = false;
                    break;
                }
            }
            if (reuse) {
                block = Murmurhash3.murmur3_32(block); 
            }
            else {
                EntropyCollector.useCpuEntropy();
            }
        }
        if (block.length == 4) {
            for (index in block) {
                bytes.push(block[index]);
                EntropyCollector.pushItemToSpareQueue(block[index]);
            }
            block = [];
        }
    }

    return bytes.slice(0, num_bytes);
}

module.exports = UnconformedTxsRandom;
