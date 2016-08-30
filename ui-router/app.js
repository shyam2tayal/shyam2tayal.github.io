'use strict';

var App = angular.module('routingDemoApp',['ui.router']);

App.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
				// For any unmatched url, send to /business
				$urlRouterProvider.otherwise("/business")
				
				$stateProvider
						
						.state('display', {
							url: "/display",
							templateUrl: "display.html"
						})

					
			}]);
