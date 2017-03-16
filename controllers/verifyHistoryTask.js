var GetDrawResult = require('../util/getDrawResult.js');

var VerifyHistoryTask = {
    get: function(req, res) {
        res.render('verifyHistoryTask', { 
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            result: req.flash('result').toString()
        });
    },

    post: function(req, res) {
 		var block = req.body.block;
			prizeInfos = JSON.parse(req.body.prizeInfos);
            mantotal = req.body.mantotal;

        console.log(block);
        console.log(prizeInfos);
        console.log(mantotal);
      
        var task = {
            blockNum: block,
            prizeInfos: prizeInfos,
			participatorNum: mantotal
        };

        GetDrawResult.verify(task, function (err, result) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/verifyHistoryTask');
            }
            var resultStr = "";
            for (i in result) {
                resultStr += "奖品等级：" + prizeInfos[i].prizeLevel 
                           + "，奖品描述："+prizeInfos[i].prizeDesc
                           + "，中奖号码："+result[i].toString()+"<br>";
                console.log("result:"+result[i]);
            }
            req.flash('result', resultStr);
            res.redirect('/verifyHistoryTask');
        });
    }
}

module.exports = VerifyHistoryTask;
