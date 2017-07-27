app.controller('MainController', function($scope,$http) { 
  

    $http.get("http://api.randomuser.me/?results=50")
      .then(function(response){

        $scope.mydata= response.data;
      });


$scope.back=true;
     










  $scope.title = 'Micro Social Directory Using AngularJs'; 
  
});

