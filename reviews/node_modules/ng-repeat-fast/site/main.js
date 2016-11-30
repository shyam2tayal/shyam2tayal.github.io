// Utils //////////////////////////////////////////////////////////////////////

function getNFromUrl() {
    return Number(location.hash.replace(/\D/g, ''));
}

function scopeProfiler($scope) {
    var scopeApply = $scope.$apply;
    $scope.$apply = function () {
        console.time('$apply');
        var result = scopeApply.apply($scope, arguments);
        setTimeout(function () {
            console.timeEnd('$apply');
        }, 0);
        return result;
    };
    return $scope;
}

// App ////////////////////////////////////////////////////////////////////////

var app = angular.module('app', ['ngRepeatFast']);

app.config(function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
});

app.controller('main', function ($scope) {
    var N = getNFromUrl() || 100;

    $scope.useFastRepeat = true;
    $scope.list = [];
    $scope.search = '';

    $scope.filter = function (list, what) {
        return list.filter(function (x) {
            return x.value.indexOf(what) != -1;
        });
    };

    $scope.add = function (i) {
        var x = '';
        while (x.length < 20) x += i;
        $scope.list.push({ value: x });
    };

    // actions ////////////////////////////////////////////////////////////////

    $scope.toggleFastRepeat = function () {
        $scope.useFastRepeat = !$scope.useFastRepeat;
    };

    $scope.addToBegin = function () {
        $scope.list.unshift({ value: 'first one' });
    };

    $scope.add2nd = function () {
        var item = { value: '2nd' };
        var head = $scope.list.slice(0, 1);
        var tail = $scope.list.slice(1);
        $scope.list = head.concat([item], tail);
    };

    $scope.addToEnd = function () {
        $scope.list.push({ value: 'last one' });
    };

    $scope.reverse = function () {
        $scope.list = $scope.list.reverse();
    };

    $scope.swap = function () {
        var tmp = $scope.list[0];
        $scope.list[0] = $scope.list[1];
        $scope.list[1] = tmp;
    };

    ///////////////////////////////////////////////////////////////////////////

    for (var i = 0; i < N; ++i) {
        $scope.add(i);
    }

    document.body.className += ' on';

    scopeProfiler($scope);
    window.main = $scope;
});

app.filter('highlight', function ($sce) {
    return function (str, search) {
        if (str && search) {
            var rx = new RegExp(search, 'i');
            var html = str.replace(rx, function (x) {
                return '<span class="hl">' + x + '</span>';
            });
            return $sce.trustAsHtml(html);
        }
        else {
            return $sce.trustAsHtml(str);
        }
    };
});
