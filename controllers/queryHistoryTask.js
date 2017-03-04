var DrawTask = require('../models/drawTask.js');

var QueryHistoryTask = {
    get: function(req, res) {

        DrawTask.get(function handle(err, data) {
            var tasks;
            if (err) {
                tasks = null;
                req.flash('error', '查询失败！');
            }
            else {
                tasks = data;
                console.log(tasks);
            }
            res.render('queryHistoryTask', { 
                title: '查询历史任务',
                user: req.session.user,
                tasks: tasks,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
   },

    post: function(req, res) {
    
    }
}

module.exports = QueryHistoryTask;
