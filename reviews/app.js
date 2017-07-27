'use strict';

var App = angular.module('routingApp',['ui.router']);

App.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
				// For any unmatched url, send to /home
				$urlRouterProvider.otherwise("/home")

				$stateProvider

						.state('display', {
							url: "/home",
							views: {
                'content': {
                    templateUrl: 'views/home.html',
										controller: 'myctrl'
                  }
						}
					})

					.state('reviews', {
						url: '/reviews/:pid/1',
						views: {
							'content': {
									templateUrl: 'views/display.html',
									 controller: 'myctrl'
								}
					}
				})



			}]);
