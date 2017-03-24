var DrawTask = require('../models/drawTask.js');
var moment = require('moment');

var CreateTask = {
    get: function(req, res) {
        res.render('createTask', { 
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    },

    post: function(req, res) {
		var drawTime = req.body.drawTimeInput;
			prizeInfos = JSON.parse(req.body.prizeInfos);
            mantotal = req.body.mantotal;
            generator = req.body.generator;
            time = null;
            block = null;

		if (isNaN(drawTime)) {	// time
			time = drawTime;
		} else {
			block = drawTime;
		}

		if (generator == 2 && time == null) {
            req.flash('error', "熵池生成器的开奖时机必须为时间！");
            return res.redirect('/createTask');
		}
       
        var newTask = new DrawTask({
            time: time,
            blockNum: block,
            prizeInfos: prizeInfos,
			participatorNum: mantotal,
            prizeResult: null,
            createTime: Date.now(),
            generator: generator
        });

        newTask.save(function (err, task) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/createTask');
            }
            req.flash('success', '创建成功！');
            res.redirect('/queryHistoryTask');
        });
    }
}

module.exports = CreateTask;
