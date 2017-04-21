var app = angular.module("shyam", []);

app.controller('myCtrl',function($scope, $http) {

		// http get request to read CSV file content
    var x2js = new X2JS();


    $scope.show_me = function(){

      $http.get($scope.rss_url).then(function(data){
          $scope.data  = x2js.xml_str2json(data.data);
          $scope.my_data = $scope.data.rss.channel;
          $scope.results = $scope.my_data.item;
          console.log($scope.my_data);
      })

      document.getElementById('grid').style.display = "block";

    }


    $('#search').keydown(function(event) {
     // enter has keyCode = 13, change it if you want to use another button
     if (event.keyCode == 13) {
            console.log("enter pressed");
            $scope.show_me();

     }
   });


});
