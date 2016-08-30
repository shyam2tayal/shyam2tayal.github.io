var routerApp = angular.module('validationApp', ['ui.router']);

routerApp.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/user/edit-details');
    
    $stateProvider
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('display', {
            url: '/user/edit-details',
            templateUrl: 'display.html'
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
