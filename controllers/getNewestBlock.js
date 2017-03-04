var request = require('request');

var GetNewestBlock = {
    getBlock: function (callback) {
        var blocksCallback = function(err, block) {
        if (err) {
            console.log(err);
            return;
        }
        setTimeout(function () { callback(block.nb); }, 0);
        };

        // Get latest block
        getBlocks("last", blocksCallback);
    }
}


function getBlocks(heightQuery, callback) {
  var error = function(message) {
    setTimeout(function () { callback(message); }, 0);
  };

  var requestUrl = "http://btc.blockr.io/api/v1/block/info/" + heightQuery;
  // var requestUrl = "http://btc.blockr.io/api/v1/block/info/last";

  get(requestUrl, function(err, response) {
    if (err) {
      error(err);
      return;
    }

    var apiResult = JSON.parse(response);
    if (apiResult.data === undefined) {
      error("Server returned incorrect data. Request URL: " + requestUrl);
      return;
    }
    else if (apiResult.data.length === 0) {
      error("Block " + heightQuery + " was not not found. Request URL: " + requestUrl);
      return;
    }

    var blocks;
    if (apiResult.data instanceof Array) {
      blocks = apiResult.data;
    } else {
      blocks = [apiResult.data];
    }
    setTimeout(function () { callback(undefined, blocks[0]); }, 0);

  });
};

function get(url, callback) {
  var error = function(message) {
    setTimeout(function () { callback(message); }, 0);
  };

  request(url, function (err, response, body) {
    if (!err && response.statusCode == 200){
      setTimeout(function () { callback(undefined, body); }, 0);
    } else {
      error("Could not get "+ url);
    }
  });
};

module.exports = GetNewestBlock;
