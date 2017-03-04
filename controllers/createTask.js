var DrawTask = require('../models/drawTask.js');
var moment = require('moment');

var CreateTask = {
    get: function(req, res) {
        res.render('createTask', { 
            title: '创建新抽奖任务', 
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    },

    post: function(req, res) {
        var time = req.body.datetimepicker,
            block = req.body.block,
            level = req.body.level,
            desc  = req.body.desc,
            prizeNum = req.body.prizeNum,
            mantotal = req.body.mantotal;

        // 做一些判断，时间>当前时间，block>当前block
        // 否则返回错误提示
        if (time == null) {
            // 还要获取最新block？算了吧，只校验时间
        } else {
            targetTime = new Date(time).getTime();
            timeNow = Date.now();
            if (targetTime <= timeNow) {
                // req.flash('error', '请'); 
                // return;
            }
        }
        
        var newTask = new DrawTask({
            time : time,
            blockNum: block,
            prizeLevel: level,
            prizeDesc: desc,
            prizeNum: prizeNum,
            participatorNum: mantotal,
            prizeResult: '未开奖'
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
