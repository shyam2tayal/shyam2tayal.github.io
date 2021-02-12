var app = angular.module("artistApp", []);

app.controller('mainController',function($scope, $http) {

    $scope.formDemand = false;
    $scope.tabbedDemand = false;
    $scope.display_me = false;
    $scope.myself = false;
    $scope.hideMe = function(){
      $scope.formDemand = true;
    }
    $scope.submitForm = function(user){
      console.log(user);
        $http.get("http://itunes.apple.com/search?term="+user.name+"&limit="+user.tracks).then(function(data){
          $scope.tabbedData = data.data.results;
          console.log($scope.tabbedData);
          $scope.tabbedDemand = true;
          $scope.formDemand = false;
        })

    }

    $scope.fetch_me = function(user,index){
      console.log(user);
      $scope.selectedIndex = index;
      $scope.display_me = true;
      $http.get("http://itunes.apple.com/search?term="+user+"&limit=1").then(function(data){
        $scope.user_data = data.data.results[0];
      })


    }




})
