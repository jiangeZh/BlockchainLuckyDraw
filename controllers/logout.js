var Logout = {
    get: function(req, res) {
  	    req.session.user = null;
  	    req.flash('success', '登出成功!');
  	    res.redirect('/');//登出成功后跳转到主页
    }
}

module.exports = Logout;
