var crypto = require('crypto'),
User = require('../models/user.js'),
Reg = require('../controllers/reg.js'),
Login = require('../controllers/login.js'),
Logout = require('../controllers/logout.js'),
CreateTask = require('../controllers/createTask.js'),
VerifyHistoryTask = require('../controllers/verifyHistoryTask.js'),
QueryBlockInfo = require('../controllers/queryBlockInfo.js'),
QueryHistoryTask = require('../controllers/queryHistoryTask.js');
GetRandomNum = require('../controllers/getRandomNum.js');

module.exports = function(app) {
    // 首页
    app.get('/', function (req, res) {
        res.render('index', {
            title: '主页',
            user: req.session.user, 
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            index: 0
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
    app.get('/queryBlockInfo', QueryBlockInfo.get);

    app.post('/queryBlockInfo', QueryBlockInfo.post);

    // 查询历史任务
    app.get('/queryHistoryTask', QueryHistoryTask.get);

    app.post('/queryHistoryTask', QueryHistoryTask.post);

    // 随机数生成器 
    app.get('/getRandomNum', GetRandomNum.get);

    app.post('/getRandomNum', GetRandomNum.post);

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
