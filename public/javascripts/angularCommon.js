var ftitAppModule = angular.module('myApp', []);

ftitAppModule.controller('SendSafeMessageController',
        function ($scope, $log) {
        $scope.fchat = new Object();
        var initStr = '{"prizeLevel":1, "prizeDesc":"iPhone7", "prizeNum":1}';
        $scope.fchat.prizeInfos = [{key: 0, value: initStr}];
        // 初始化时由于只有1条信息，所以不允许删除
        $scope.fchat.canDescPrizeInfo = false;

        // 增加信息数
        $scope.fchat.incrPrizeInfo = function($index) {
        $scope.fchat.prizeInfos.splice($index + 1, 0,
            {key: new Date().getTime(), value: initStr});   // 用时间戳作为每个item的key
        // 增加新的信息后允许删除
        $scope.fchat.canDescPrizeInfo = true;
        }

        $scope.fchat.setPrizeInfo = function($index) {
            var id      = $index + 1;
            var level   = document.getElementById("prizeLevel"+id).value;
            var desc    = document.getElementById("prizeDesc"+id).value;
            var total   = document.getElementById("prizeNum"+id).value;

            if (level == "" || total == "" || level < 0 || total <= 0) {
                alert("奖品等级或奖品数量不合法!");
            }
            else {
                $scope.fchat.prizeInfos[$index].value='{"prizeLevel":' + level + ', "prizeDesc":"' + desc + '", "prizeNum":' + total + '}';
                
                var model = '#myModal' + id;
                $(model).modal('hide');
            }
        }

        // 减少信息数
        $scope.fchat.decrPrizeInfo = function($index) {
        // 如果回复数大于1，删除被点击信息
        if ($scope.fchat.prizeInfos.length > 1) {
        $scope.fchat.prizeInfos.splice($index, 1);
        }
        // 如果信息数为1，不允许删除
        if ($scope.fchat.prizeInfos.length == 1) {
            $scope.fchat.canDescPrizeInfo = false;
        }
        }

        $scope.fchat.combinePrizeInfos = function() {
            var cr = "";
            for (var i = 0; i < $scope.fchat.prizeInfos.length; i++) {
                cr += "," + $scope.fchat.prizeInfos[i].value;
            }
            cr += "]"
            cr = "[" + cr.substring(1);
            $log.debug("Combined prizeInfos: " + cr);

            return cr;
        }
        }
);

