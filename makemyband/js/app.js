var routerApp = angular.module('validationApp', ['ui.router']);

routerApp.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/business")
                
                $stateProvider
                        .state('business', {
                            url: "/business",
                            templateUrl: "business.html"
                        })
                        .state('business.products', {
                            url: "/products",
                            templateUrl: "products.html",
                            controller: function($scope){
                                $scope.products = ["Computer", "Printers", "Phones", "Bags"];
                            }
                        })
                        .state('business.services', {
                            url: "/services",
                            templateUrl: "services.html",
                            controller: function($scope){
                                $scope.services = ["Selling", "Support", "Delivery", "Reparation"];
                            }
                        })
        
        // nested list with custom controller
        
        
        
   
    
        
}]);

routerApp.controller('scotchController', function($scope) {
    
    $scope.message = 'test';
   
    $scope.scotches = [
        {
            name: 'Macallan 12',
            price: 50
        },
        {
            name: 'Chivas Regal Royal Salute',
            price: 10000
        },
        {
            name: 'Glenfiddich 1937',
            price: 20000
        }
    ];
    
});
