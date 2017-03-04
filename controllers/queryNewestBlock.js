var request = require('request');
var GetNewestBlock= require('./getNewestBlock.js');

var QueryNewestBlock = {
    get: function(req, res) {
        GetNewestBlock.getBlock(function(block) { 
            setTimeout(function () { 
                var newestBlock = block; 
                res.render('queryNewestBlock', { 
                    title: '查询最新区块号',
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString(),
                    block: newestBlock
                });
            }, 0); 
        });
    },

    post: function(req, res) {
    
    }
}

module.exports = QueryNewestBlock;
