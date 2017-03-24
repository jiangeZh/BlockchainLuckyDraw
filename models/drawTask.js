var mongodb = require('./db');

function DrawTask(task) {
    // 开奖时间戳
    this.time = task.time;

    // 所用的区块号，由时间戳来确定
    this.blockNum = task.blockNum;

    this.generator = task.generator;

    this.prizeInfos = task.prizeInfos;

    // 参与人数
    this.participatorNum = task.participatorNum;

    // 抽奖结果
    this.prizeResult = task.prizeResult;

    this.createTime = task.createTime;
};

module.exports = DrawTask;

//存储用户信息
DrawTask.prototype.save = function(callback) {
    //要存入数据库的用户文档
    var task = {
        time: this.time,
        blockNum: this.blockNum,
        generator: this.generator,
        prizeInfos: this.prizeInfos,
        participatorNum: this.participatorNum,
        prizeResult: this.prizeResult,
        createTime: this.createTime
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 tasks 集合
        db.collection('tasks', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //将数据插入 tasks 集合
            collection.insert(task, {
                safe: true
            }, function (err, task) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null, task[0]);//成功！err 为 null，并返回存储后的用户文档
            });
        });
    });
};

// 分页读取任务信息
DrawTask.findPagination = function(obj, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 tasks 集合
        db.collection('tasks', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }

            collection.count( function(err, count) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }

                var pageNumber = obj.pageNum || 1;
                var resultsPerPage = obj.limit || 10;
                var skipFrom = (pageNumber-1) * resultsPerPage;
                var pageCount = Math.ceil(count/resultsPerPage);

                collection.find({},{sort:{createTime:1}, skip:skipFrom, limit:resultsPerPage}).toArray( function(err, tasks) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, tasks, pageCount);
                });
            });
        });
    });
};

DrawTask.getUnfinishedDrawTasks = function(callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            // 打开失败，不用close了
            return callback(err);//错误，返回 err 信息
        }
        //读取 tasks 集合
        db.collection('tasks', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            var whereStr = {"prizeResult":null};
            collection.find(whereStr).toArray( function(err, tasks) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, tasks);
            });
        });
    });
};

DrawTask.updateResultById = function(task, result, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            // 打开失败，不用close了
            return callback(err);//错误，返回 err 信息
        }
        //读取 tasks 集合
        db.collection('tasks', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.update({"_id": task["_id"]}, {$set:{"time":task["time"], "blockNum":task["blockNum"], "prizeResult":result}}, {safe:true}, function(err, result) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
