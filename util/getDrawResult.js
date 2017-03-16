var async = require('async');
var request = require('request');
var moment = require('moment');
var DrawTask = require('../models/drawTask.js');
var GetNewestBlock = require('./getNewestBlock.js');
var LCGRandom = require('./LCGRandom.js');

var GetDrawResult = {
    execute: function() {
        async.parallel([
            // step 1: 获取最新区块
            // 出现超时情况
            function(callback) {
                GetNewestBlock.getBlock(function(block) { 
                    callback(null, block);
                });
            },
            // step2: 从db中取出未开奖的task
            function(callback) {
                DrawTask.getUnfinishedDrawTasks(function(err, tasks) {
                    if (err) callback(err);
                    else {
                        callback(null, tasks); 
                    }
                });
            }
        
        ], _getDrawResults);
    },
    
    verify: function(task, callback) {
        GetNewestBlock.getBlock(function(block) {
            if (task['blockNum'] > block) {
                callback("最新区块号为:"+block+",请重新输入合法的区块号");
                return;
            }
            // 获取对应区块的信息
            getNonce(task, function(err, task, nonce) {
                getWinners(task, nonce, function(task, result) {
                    callback(null, result);
                });
            });
        });
    }
}

function _getDrawResults(err, results) {
   var newestblock = results[0];
   var tasks = results[1];
   for (var index in tasks) {
       var task = tasks[index];
       var timeStr = task['time'];
       var targetTime, timeNow;
       if (task['blockNum'] == null) {
           targetTime = new Date(timeStr).getTime(); // 时间戳
           timeNow = Date.now();
           // 如果保证所选时间一定大于当前时间，由于后台不断轮询，因此目标区块为最新区块的下一个区块
           if (targetTime <= timeNow) {
               task['blockNum'] = newestblock + 1;
                // 存db
               DrawTask.updateResultById(task, null, function(err, result) {
                   if (err)
                       console.log(err);
               });
          }
       }
       // 满足开奖条件
       var targetBlockHeight = task['blockNum'];
       if (targetBlockHeight != null && targetBlockHeight <= newestblock) { 
           if (timeStr == null) {
               task['time'] = moment(Date.now()).format('YYYY-MM-DD HH:mm');
           }
           // 获取对应区块的信息
           getNonce(task, function(err, task, nonce) {
               getWinners(task, nonce, function(task, result) {
                   // 存db
                   DrawTask.updateResultById(task, result, function(err, result) {
                       if (err)
                           console.log(err);
                   });
               });
           });
       }
   }
}

function getNonce(task, callback) {
    var targetBlockHeight = task['blockNum'];
    var apiUrl = "http://btc.blockr.io/api/v1/block/raw/" + targetBlockHeight;
    request(apiUrl, function (error, response, body) {
        if (!error && response.statusCode == 200){
            var apiResult = JSON.parse(body);
            if (apiResult.data === undefined || apiResult.data.nonce === undefined) {
                callback("Server returned incorrect data. Request URL: " + apiUrl, task);
                return;
            }
            callback(null, task, apiResult.data.nonce);
        } else {
            callback(request.statusText === "" ? "Could not get "+ url : request.statusText, task);
        }
    });
}

function getWinners(task, nonce, callback) {
    var array = new Array();
    for (var i = 1; i <= task["participatorNum"]; ++i) {
        array.push(i);
	}

	var prizeNum = 0;
	for (index in task['prizeInfos']) {
		prizeNum += task['prizeInfos'][index]['prizeNum'];
	}

	console.log("nonce:"+nonce);
	console.log("prizeNum:"+prizeNum);
	
	var resultArray = LCGRandom.randArray(nonce, prizeNum, array);

    var indexOfResult = 0;
    var results = new Array();
	for (indexOfInfo in task['prizeInfos']) {
		var prizeNum = task['prizeInfos'][indexOfInfo]['prizeNum'];
        var array = new Array();
        for (var i = 0; i < prizeNum; ++i) {
            array.push(resultArray[indexOfResult]);
            indexOfResult++;
        }
        results.push(array);
	}
    console.log(results);

    callback(task, results);
}                    

module.exports = GetDrawResult;
