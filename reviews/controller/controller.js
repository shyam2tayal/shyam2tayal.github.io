App.controller('myctrl', ['$scope', '$stateParams','$filter','$http',function($scope,$stateParams,$filter,$http) {

//extracting id given in url
  $scope.pid = $stateParams.pid;
  console.log($scope.pid);
  $scope.getNumber = function(num) {
         return new Array(num);
     };
    $scope.myNumber = 5;

    $http.get("http://www.i2ce.in/reviews/"+$scope.pid+"/1")
         .then(function(response){

           $scope.mydata1= response.data;
           console.log($scope.mydata1);
           for(var key in $scope.mydata1){
             console.log(key);
             console.log($scope.mydata1[key]);
             if($scope.mydata1[key] == $scope.pid){
               $scope.mydata3 = $scope.mydata1['reviews'];
               console.log($scope.mydata3);
             }
           }

           $scope.getData = function () {
             return $filter('filter')($scope.mydata3, $scope.q)
           }

           $scope.numberOfPages=function(){
               return Math.ceil($scope.getData().length/$scope.pageSize);
           }
           /////////////////////////////////////////////////////////////////////////////////////////////


         });

//////////////////////////////////////////////////////////////////////////////////////////
//Creating pagination in the APP
$scope.currentPage = 0;
$scope.pageSize = 3;
$scope.q = '';



}]);

//filter for pagination
App.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
