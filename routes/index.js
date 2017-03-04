var crypto = require('crypto'),
User = require('../models/user.js'),
Reg = require('../controllers/reg.js'),
Login = require('../controllers/login.js'),
Logout = require('../controllers/logout.js'),
CreateTask = require('../controllers/createTask.js'),
VerifyHistoryTask = require('../controllers/verifyHistoryTask.js'),
QueryNewestBlock = require('../controllers/queryNewestBlock.js'),
QueryHistoryTask = require('../controllers/queryHistoryTask.js');

module.exports = function(app) {
    // 首页
    app.get('/', function (req, res) {
        res.render('index', {
            title: '主页',
            user: req.session.user, 
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
	    });
    });

    // 注册
    app.get('/reg', checkNotLogin);
    app.get('/reg', Reg.get);

    app.post('/reg', checkNotLogin);
    app.post('/reg', Reg.post);

    // 登录
    app.get('/login', checkNotLogin);
    app.get('/login', Login.get);

    app.post('/login', checkNotLogin);
    app.post('/login', Login.post);

    // 登出
    app.get('/logout', checkLogin);
    app.get('/logout', Logout.get);

    // 创建新抽奖任务
    app.get('/createTask', checkLogin);
    app.get('/createTask', CreateTask.get);

    app.post('/createTask', checkLogin);
    app.post('/createTask', CreateTask.post);

    // 验证历史抽奖结果 
    app.get('/verifyHistoryTask', VerifyHistoryTask.get);

    app.post('/verifyHistoryTask', VerifyHistoryTask.post);

    // 查询最新区块号 
    app.get('/queryNewestBlock', QueryNewestBlock.get);

    app.post('/queryNewestBlock', QueryNewestBlock.post);

    // 查询历史任务
    app.get('/queryHistoryTask', QueryHistoryTask.get);

    app.post('/queryHistoryTask', QueryHistoryTask.post);

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!'); 
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!'); 
            res.redirect('back');
        }
        next();
    }
};
