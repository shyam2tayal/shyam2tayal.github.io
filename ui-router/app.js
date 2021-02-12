'use strict';

var App = angular.module('routingApp',['ui.router']);

App.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
				// For any unmatched url, send to /business
				$urlRouterProvider.otherwise("/user/edit-details")
				
				$stateProvider
						
						.state('display', {
							url: "/user/details",
							templateUrl: "display.html"
						})

					
			}]);
