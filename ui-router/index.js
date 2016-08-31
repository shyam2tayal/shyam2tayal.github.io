


	// create angular app
	var validationApp = angular.module('routingApp', []);

	// create angular controller
	validationApp.controller('mainController', function($scope) {

		// function to submit the form after all validation has occurred			
		$scope.submitForm = function() {

			// check to make sure the form is completely valid
			if ($scope.userForm.$valid) {
				alert('Form Submitted');
			}

			var name = $scope.user.name;

			var email = $scope.user.email;

			var instrument = $scope.user.instrument;

			var city = $scope.user.city;

		};

	});


	