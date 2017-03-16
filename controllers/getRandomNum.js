var request = require('request');
var LCGRandom= require('../util/LCGRandom.js');
var UnconformedTxsRandom = require('../util/unconformedTxsRandom.js');

var GetRandomNum = {
    get: function(req, res) {
                res.render('getRandomNum', { 
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString(),
                    rawInfo: req.flash('rawInfo').toString(),
                    randomNumList: req.flash('randomNumList').toString(),
                });
    },

    post: function(req, res) {
        var type = req.body.type,
            min = Number(req.body.numRangeMin),
            max = Number(req.body.numRangeMax),
            number = req.body.numToGet,
            array = new Array();

        for (var i = min; i < max; ++i) {
            array.push(i);
        }

        if (type == 1) {
            var seed= req.body.seed;
           
            var rawInfo = "种子：" + seed + "，随机数个数：" + number + "，随机区间：" + min + "～" + max;
	        var resultArray = LCGRandom.randArray(seed, number, array);

	        req.flash('rawInfo', rawInfo);
	        req.flash('randomNumList', resultArray);
        }
        else {
            var rawInfo = "随机数个数：" + number + "，随机区间：" + min + "～" + max;
	        var resultArray= UnconformedTxsRandom.randIntArray(number, array);

	        req.flash('rawInfo', rawInfo);
	        req.flash('randomNumList', resultArray);
        }

        res.redirect('/getRandomNum');
    }
}

module.exports = GetRandomNum;
