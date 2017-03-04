var async = require('async');
var request = require('request');
var moment = require('moment');
var DrawTask = require('../models/drawTask.js');
var GetNewestBlock = require('./getNewestBlock.js');

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
        
        ],
        function(err, results){
            var newestblock = results[0];
            var tasks = results[1];
            for (var index in tasks) {
                var task = tasks[index];
                var targetBlockHeight = task['blockNum'];
                var timeStr = task['time'];
                var targetTime, timeNow;
                if (timeStr != null) {
                    targetTime = new Date(timeStr).getTime(); // 时间戳
                    timeNow = Date.now();
                    console.log(targetTime);
                    console.log(timeNow);
                }
                // 满足开奖条件
                if ((targetBlockHeight != null && targetBlockHeight <= newestblock) ||
                    (timeStr != null && targetTime <= timeNow)) {// 如果保证所选时间一定要大于当前时间，由于后台不断轮询，因此目标区块必定是最新区块
                    if (timeStr == null) {
                        task['time'] = moment(Date.now()).format('YYYY-MM-DD HH:mm');
                    }
                    else {
                        task['blockNum'] = newestblock;
                    }
                    // 获取对应区块的信息
                    getTxs(task, function(err, task, txs) {
                        getWinners(task, txs, function(task, result) {
                            console.log(result);
                            // 存db
                            DrawTask.updateResultById(task, result, function(err, result) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                }
            }
        });
   }
}

function getTxs(task, callback) {
    var targetBlockHeight = task['blockNum'];
    var apiUrl = "http://btc.blockr.io/api/v1/block/txs/" + targetBlockHeight;
    request(apiUrl, function (error, response, body) {
        if (!error && response.statusCode == 200){
            var apiResult = JSON.parse(body);
            if (apiResult.data === undefined || apiResult.data.txs === undefined) {
                callback("Server returned incorrect data. Request URL: " + apiUrl, task);
                return;
            }
            callback(null, task, apiResult.data.txs);
        } else {
            callback(request.statusText === "" ? "Could not get "+ url : request.statusText, task);
        }
    });
}

function getWinners(task, txs, callback) {
    var result = new Array();
    console.log('txs.length');
    console.log(txs.length);    // 貌似上限是100
    for (var i = 0; i < task['prizeInfo'][0]['prizeNum'] && i < txs.length; i++) {
        var winner_id ;
        var last8digit =   txs[i].tx;
        last8digit = last8digit.substr(-8, last8digit.length);

        winner_id= parseInt(last8digit.toString(),16);

        winner_id = winner_id % task["participatorNum"];

        result.push(winner_id + 1);
    }
    callback(task, result);
}                    
 

module.exports = GetDrawResult;
