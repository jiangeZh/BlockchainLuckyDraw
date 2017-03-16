var bignum = require('bignum');

var MurmurHash3 = {
    murmur3_32: function(key, seed) {
        /*
         * Pure NodeJs implementation of 32-bit murmur3 hashing algorithm. Not
         * cryptographically secure, but well-distributed and good enough for our
         * purposes.
         */

        if (seed === undefined) {
            seed = 0x0;
        }

        var len = key.length;

        // mixing constants
        var c1 = 0xcc9e2d51,
            c2 = 0x1b873593,
            r1 = 15,
            r2 = 13,
            m = 5,
            n = 0xe6546b64,
            nblocks = len/4,
            mhash = seed;

        // mix into hash, 4 bytes at a time
        for (var block_start = 0; block_start < nblocks*4; block_start += 4) {
            var k = key[block_start + 3] << 24 | 
                    key[block_start + 2] << 16 | 
                    key[block_start + 1] << 8 | 
                    key[block_start + 0];

            k = bignum(k).mul(c1).and(0xFFFFFFFF);
            //k = (k << r1 | k >> (32-r1)) & 0xFFFFFFFF;
            k = k.shiftLeft(r1).or(k.shiftRight(32-r1)).and(0xFFFFFFFF);
            k = k.mul(c2).and(0xFFFFFFFF);
            mhash = bignum(mhash).xor(k);
            //mhash = (mhash << r2 | mhash >> (32-r2)) & 0xFFFFFFFF;
            mhash = mhash.shiftLeft(r2).or(mhash.shiftRight(32-r2)).and(0xFFFFFFFF);
            mhash = mhash.mul(m).add(n).and(0xFFFFFFFF);
        }

        // make sure last few bytes are mixed (no endian swapping)
        var remaining_bytes_index = (len / 4) * 4;
        var num_remaining_bytes = len & 3;
        k = 0;

        if (num_remaining_bytes == 3) {
            k ^= key[remaining_bytes_index + 2] << 16;
            k ^= key[remaining_bytes_index + 1] << 8;
            k ^= key[remaining_bytes_index + 0];
            //k = (k * c1) & 0xFFFFFFFF;
            k = bignum(k).mul(c1).and(0xFFFFFFFF);
            //k = (k << 16 | k >> 16) & 0xFFFFFFFF;
            k = bignum(k).shiftLeft(16).or(k.shiftRight(16)).and(0xFFFFFFFF);
            //k = (k * c2) & 0xFFFFFFFF;
            k = bignum(k).mul(c2).and(0xFFFFFFFF);
            //mhash ^= k;
            mhash = bignum(mhash).xor(k);
        }
        else if (num_remaining_bytes == 2) {
            k ^= key[remaining_bytes_index + 1] << 8;
            k ^= key[remaining_bytes_index + 0];
            k = bignum(k).mul(c1).and(0xFFFFFFFF);
            k = bignum(k).shiftLeft(16).or(k.shiftRight(16)).and(0xFFFFFFFF);
            k = bignum(k).mul(c2).and(0xFFFFFFFF);
            mhash = bignum(mhash).xor(k);
        }
        else if (num_remaining_bytes == 1) {
            k ^= key[remaining_bytes_index + 0];
            k = bignum(k).mul(c1).and(0xFFFFFFFF);
            k = bignum(k).shiftLeft(16).or(k.shiftRight(16)).and(0xFFFFFFFF);
            k = bignum(k).mul(c2).and(0xFFFFFFFF);
            mhash = bignum(mhash).xor(k);
        }
        else if (num_remaining_bytes == 1) {
            k ^= key[remaining_bytes_index + 0];
            k = bignum(k).mul(c1).and(0xFFFFFFFF);
            k = bignum(k).shiftLeft(16).or(k.shiftRight(16)).and(0xFFFFFFFF);
            k = bignum(k).mul(c2).and(0xFFFFFFFF);
            mhash = bignum(mhash).xor(k);
        }

        // additionl mixing
        mhash ^= len;
        mhash = bignum(mhash).xor(bignum(mhash).shiftRight(16));
        mhash = mhash.mul(0x85ebca6b).and(0xFFFFFFFF);
        mhash = mhash.xor(mhash.shiftRight(13));
        mhash = mhash.mul(0xc2b2ae35).and(0xFFFFFFFF);
        mhash = mhash.xor(mhash.shiftRight(16));
    
        console.log(mhash);
        // 测试到此处

        hex_result = mhash.toString(16);
        if (hex_result.length < 8) {
            hex_result = "0" * (8 - hex_result.length) + hex_result;
        }

        var bytes = new Buffer(hex_result, 'hex');
        return bytes; 
    }
}

module.exports = MurmurHash3;
