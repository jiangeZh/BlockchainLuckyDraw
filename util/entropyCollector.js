var request = require('request');

var most_recent = 0;
var queue = new Array();
var spare_queue = new Array();
var url = "http://blockchain.info/unconfirmed-transactions?format=json";

var EntropyCollector = {
    execute: function() {
        // Stream new entropy from blockchain.info.
        get_unconfirmed_transactions(url, function(err, transactions) {
            console.log(err);
            console.log(transactions);
            if (err) {
                console.log(err);
                return ;
            }
            // transactions undefined??
            if (transactions.length > 0) {
                fill_queue(transactions);
            }   
        
        });
    },

    useCpuEntropy: function () {
        /*
         * If we were never able to connect to blockchain.info, and thus have no
         * entropy in the spare cache, lean on Python's random.SystemRandom to get
         * some entropy.
         */
        for (var i = 0; i < 8 && spare_queue.length < 5000; ++i) {
            var item = getSystemRandomNum(0, 256);
            spare_queue.unshift(item);
        }
    },

    getItemFromQueue: function() {
        if (queue.length == 0) {
            return -1;
        }
        return queue.pop();
    },

    getItemFromSpareQueue: function() {
        if (spare_queue.length == 0) {
            return -1;
        }
        return spare_queue.pop();
    },

    pushItemToSpareQueue: function(item) {
        if (spare_queue.length < 5000) {
            spare_queue.unshift(item);
        }
    }
}

function get_unconfirmed_transactions(url, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200){
            var apiResult = JSON.parse(body);
            if (apiResult.txs === undefined) {
                callback("Server returned incorrect data. Request URL: " + url);
                return;
            }
            callback(null, apiResult.txs);
        } else {
            callback(request.statusText === "" ? "Could not get "+ url : request.statusText);
        }
    });
}

function fill_queue(trans) {
    /* 
     * Fill the main queue and spare queue with entropy from recent
     * transactions.
     */
    var most_recent_trans_time = 0;
    for (i in trans) {
        if (trans[i]['time'] > most_recent_trans_time) {
            most_recent_trans_time = trans[i]['time'];
        }
    }
    
    if (most_recent_trans_time > most_recent) {
        var hex_hashes = "";
        for (i in trans) {
            if (trans[i]['time'] > most_recent) {
                hex_hashes += trans[i]['hash'];
            }
        }
        most_recent = most_recent_trans_time;
        var bytes = new Buffer(hex_hashes, 'hex');
        for (i in bytes) {
            if (queue.length < 5000) {
                // 数组头部插入
                queue.unshift(bytes[i]);
            }
            if (spare_queue.length < 5000) {
                // 备用数组
                spare_queue.unshift(bytes[i]);
            }
        }
    }
}


function getSystemRandomNum(min, max)
{   
    var Range = max - min;   
    var Rand = Math.random();   
    return (min + Math.round(Rand * Range));   
}

module.exports = EntropyCollector;
