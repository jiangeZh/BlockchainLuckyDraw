var DrawTask = require('../models/drawTask.js');
var moment = require('moment');

var QueryHistoryTask = {
    get: function(req, res) {
        var page = {limit:5, pageNum:1};
        if (req.query.p) {
            page['pageNum'] = req.query.p<1?1:req.query.p;
        }

        DrawTask.findPagination(page, function handle(err, data, pageCount) {
            var tasks;
            if (err) {
                tasks = null;
                req.flash('error', '查询失败！');
            }
            else {
                tasks = data;
                for (i in tasks) {
                    tasks[i]['createTime'] = moment(tasks[i]['createTime']).format('YYYY-MM-DD HH:mm');
                } 
            }
            page['pageCount'] = pageCount;
            page['size'] = tasks.length;
            page['numberOfPages'] = pageCount>5?5:pageCount;
            res.render('queryHistoryTask', { 
                user: req.session.user,
                tasks: tasks,
                page: page,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
   },

    post: function(req, res) {
    
    }
}

module.exports = QueryHistoryTask;
