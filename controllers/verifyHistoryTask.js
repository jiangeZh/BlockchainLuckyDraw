
var VerifyHistoryTask = {
    get: function(req, res) {
        res.render('verifyHistoryTask', { 
            title: '验证历史抽奖结果',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    },

    post: function(req, res) {
    
    }
}

module.exports = VerifyHistoryTask;
