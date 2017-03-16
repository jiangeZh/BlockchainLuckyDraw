var request = require('request');
var GetNewestBlock= require('../util/getNewestBlock.js');

var QueryBlockInfo = {
    get: function(req, res) {
        GetNewestBlock.getBlock(function(block) { 
            setTimeout(function () { 
                var newestBlock = block; 
                res.render('queryBlockInfo', { 
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString(),
                    newestBlock: newestBlock,
                    blockInfo: req.flash('blockInfo').toString()
                });
            }, 0); 
        });
    },

    post: function(req, res) {
        var targetBlockHeight = req.body.blockNum;
        var apiUrl = "http://btc.blockr.io/api/v1/block/raw/" + targetBlockHeight;
        request(apiUrl, function (error, response, body) {
            if (!error && response.statusCode == 200){
                var apiResult = JSON.parse(body);
                if (apiResult.data === undefined || apiResult.data.nonce === undefined) {
                    req.flash('error', "Server returned incorrect data. Request URL: " + apiUrl);
                    res.redirect('/queryBlockInfo');
                    return;
                }
                req.flash('blockInfo', "区块"+targetBlockHeight+"的nonce值为："+apiResult.data.nonce);
            } else {
                req.flash('error', request.statusText === "" ? "Could not get "+ url : request.statusText);
            }
            res.redirect('/queryBlockInfo');
        });
    }
}

module.exports = QueryBlockInfo;
