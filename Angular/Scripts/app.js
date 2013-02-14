var TodoApp = angular.module("TodoApp", ["ngResource"]).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', { controller: ListCtrl, templateUrl: 'list.html' }).
            when('/new', { controller: CreateCtrl, templateUrl: 'details.html' }).
            when('/edit/:itemId', { controller: EditCtrl, templateUrl: 'details.html'}).
            otherwise({ redirecTo: '/' });
    })
.directive('sorted', function () {
    return {
        scope: true,
        transclude: true,
        template: '<a ng-click="do_sort()" ng-transclude></a>' +
    '<span ng-show="do_show(true)"><i class="icon-circle-arrow-down"></i></span>' +
    '<span ng-show="do_show(false)"><i class="icon-circle-arrow-up"></i></span>',
        controller: function ($scope, $element, $attrs) {
            $scope.sort = $attrs.sorted;
            $scope.do_sort = function () { $scope.sort_by($scope.sort); };
            $scope.do_show = function (asc) {
                return (asc != $scope.is_desc) && ($scope.sort_order == $scope.sort);
            }
        }
    }
});



TodoApp.factory('Todo', function($resource){
    return $resource('/api/Todo/:id',{id:'@id'}, {update:{method:'PUT'}});
});

var CreateCtrl = function ($scope, $location, Todo) {
    $scope.action = 'Add';
    $scope.save = function () {
        Todo.save($scope.item, function () {
            $location.path('/');
        });
    };
};

var EditCtrl = function ($scope, $routeParams, $location, Todo) {
    $scope.action = 'Update';
    $scope.item = Todo.get({ id: $routeParams.itemId });
    $scope.save = function () {
        Todo.update({ id: $scope.item.Id }, $scope.item, function () {
            $location.path('/');
        });
    };
};
var ListCtrl = function ($scope, $location, Todo) {
    $scope.search = function () {
            Todo.query({ sort: $scope.sort_order, desc: $scope.is_desc, limit:$scope.limit, offset:$scope.offset, q:$scope.query},
            function (data) {
                var cnt = data.length;
                $scope.no_more = cnt < $scope.limit;
                $scope.items = $scope.items.concat(data);
                });
    };

    $scope.delete = function (row) {
        Todo.delete({ id: row.item.Id }, function () {
            //var index = $scope.items.indexOf(row.item);
            //$scope.items.splice(index, 1);
            $('#todo_' + row.item.Id).fadeOut();
        })
    }

    $scope.sort_by = function (col) {
        if ($scope.sort_order === col)
            $scope.is_desc = !$scope.is_desc;
        else {
            $scope.sort_order = col;
            $scope.is_desc = false;
        }
        $scope.reset();
    };

    $scope.show_more = function(){
        $scope.offset += $scope.limit;
        $scope.search();
    };

    $scope.do_show = function (asc, col) {
        return (asc != $scope.is_desc) && ($scope.sort_order == col);
    };

    $scope.reset = function () {
        $scope.offset = 0;
        $scope.items = [];
        $scope.search();
    };

    $scope.sort_order = "Priority";
    $scope.is_desc = false;
    $scope.limit = 10;
    $scope.offset = 0;
    $scope.items = [];
    $scope.query = '';
    $scope.search();

};