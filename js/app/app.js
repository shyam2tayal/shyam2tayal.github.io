// CREATE THE MODULE AND NAME IT cleanBlog
var app = angular.module("app", ["ngAnimate", "ui.router", "ngSanitize",'btford.markdown']);

app.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams)
{
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}]);

// CONFIGURE OUR ROUTES
app.config(function($stateProvider, $urlRouterProvider, $locationProvider)
{

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl : 'pages/home.html',
      controller: 'mainController'
    })

    .state('about', {
      url: '/about',
      templateUrl : 'pages/page.html',
      controller: 'aboutController'
    })

    .state('contact', {
      url: '/contact',
      templateUrl : 'pages/contact.html',
      controller: 'contactController'
    })

    .state('post', {
      url: '/post/{id}',
      templateUrl: 'pages/post.html',
      controller: 'postController'
    })

});

// Posts Pagination
app.directive('postsPagination', function(){
  return{
    restrict: 'E',
    template: '<ul class="pager" ng-show="pager">'+
    '<li class="previous" ng-show="currentPage != 1">'+
    '<a ng-click="postRefresh(currentPage-1)">&larr; Newer Posts</a>'+
    '</li>'+
    '<li class="next" ng-show="currentPage != totalPages">'+
    '<a ng-click="postRefresh(currentPage+1)">Older Posts &rarr;</a>'+
    '</li>'+
    '</ul>'
  };
});
app.directive("seeMore", ['$timeout','$compile', function (timer,compile) {
    return {
        link: function (scope, elem, attrs) {
          var action=function(){
          var text=elem.html();
          var changedString = String(text).replace(/<[^>]+>/gm, '');
          var flag=changedString.length > 200 ? true : false;
          if(flag)
          {
              var seeMoreText=changedString.substr(0, 200 - 1)+ " ";
              elem.text(seeMoreText);
              var keyEl = angular.element('<a ui-sref="post({id:post.id,slug:post.post_slug})">See more</a>' );
              elem.append(keyEl);
              compile(keyEl)(scope);
          }
        }
          timer(action, 0);
      }
   }
}]);
// Limit the Posts content text on the Post list page/home page
app.filter('limitHtml', function() {
  return function(text, limit) {

    var changedString = String(text).replace(/<[^>]+>/gm, '');
    var length = changedString.length;

    return changedString.length > limit ? changedString.substr(0, limit - 1) + '...' : changedString;
  }
});

// Get current year
app.filter('currentYear',['$filter',  function($filter) {
  return function() {
    return $filter('date')(new Date(), 'yyyy');
  };
}])

// MAIN CONTROLLER/HOME
app.controller('mainController', function($scope, $http, $sce, $timeout, $stateParams)
{

  $scope.page_title = 'Every bit of internet needs javascript';
  $scope.page_subtitle = 'The most popular language in the world';

  $scope.date = new Date();

  $scope.posts = [];
  $scope.totalPages = 0;
  $scope.currentPage = 1;
  $scope.range = [];
  $scope.loading = false;
  $scope.pager = false;

  // DATE FORMAT
  $scope.dateFormat = function(dateString)
  {
    if (dateString) {
      var properlyFormattedDate = dateString.split(" ").join("T");
      return new Date(properlyFormattedDate);
    } else {
      return null;
    }
  };

  // GET POSTS FUNCTION
  $scope.getPosts = function(pageNumber) {

    pageNumber = $stateParams.id;

    if(pageNumber===undefined)
    {
      pageNumber = '1';
    }

    $scope.loading = true;

    $http.get('json/post.json').success(function(response) {
      $scope.totalPosts=response
      if(response.length>5)
        $scope.posts = response.slice(0,5);
      else
        $scope.posts = response.slice(0);
      if(response.length%5!=0)
        $scope.totalPages   = Math.floor(response.length/5)+1;
      else
        $scope.totalPages   = Math.floor(response.length/5);
      $scope.currentPage  = 1;
      $scope.loading = false;
      $scope.pager = true;


      if(pageNumber > $scope.totalPages)
      {
        $scope.noResult = true;
        $scope.loading = false;
        $scope.pager = false;
      }
    });
  };
$scope.postRefresh=function(currentPage){
  $scope.buttonClicked=true;
  $scope.currentPage=currentPage;
  if($scope.totalPosts.length-currentPage*5<0){
    $scope.posts = $scope.totalPosts.slice((currentPage-1)*5,currentPage*5);
  }
  else{
    $scope.posts = $scope.totalPosts.slice((currentPage-1)*5);
  }
}
  $scope.getPosts();
});

// POST CONTROLLER
app.controller('postController', function($scope, $http, $state, $stateParams)
{
  
  if($stateParams.id == undefined) {
    $state.go('home');
  }

  // DATE FORMAT
  $scope.dateFormat = function(dateString)
  {
    if (dateString) {
      var properlyFormattedDate = dateString.split(" ").join("T");
      return new Date(properlyFormattedDate);
    } else {
      return null;
    }
  };

  post_id = $stateParams.id;

  // $http.get('http://laravel.dev/api/post/'+post_id).success(function(response) {
  $http.get('json/post.json').success(function(response) {
    var post_data = response;
    post_data = post_data.filter(function (index) {
      return index.id == post_id;
    });
    $scope.post_data = post_data[0];
  });
});

// ABOUT CONTROLLER
app.controller('aboutController', function($scope,$http)
{
  $scope.page_title = 'About Me';
  $scope.page_subtitle = 'This is what I do.';

});

// Show errors on the Contact page
app.directive('showErrors', function ($timeout, showErrorsConfig) {
  var getShowSuccess, linkFn;

  getShowSuccess = function (options) {
    var showSuccess;
    showSuccess = showErrorsConfig.showSuccess;
    if (options && options.showSuccess != null) {
      showSuccess = options.showSuccess;
    }
    return showSuccess;
  };

  linkFn = function (scope, el, attrs, formCtrl) {
    var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;

    blurred = false;
    options = scope.$eval(attrs.showErrors);
    showSuccess = getShowSuccess(options);
    inputEl = el[0].querySelector('[name]');
    inputNgEl = angular.element(inputEl);
    inputName = inputNgEl.attr('name');
    if (!inputName) {
      throw 'show-errors element has no child input elements with a \'name\' attribute';
    }

    inputNgEl.bind('blur', function () {
      blurred = true;
      return toggleClasses(formCtrl[inputName].$invalid);
    });

    scope.$watch(function () {
      return formCtrl[inputName] && formCtrl[inputName].$invalid;
    }, function (invalid) {
      if (!blurred) {
        return;
      }
      return toggleClasses(invalid);
    });

    scope.$on('show-errors-check-validity', function () {
      return toggleClasses(formCtrl[inputName].$invalid);
    });

    scope.$on('show-errors-reset', function () {
      return $timeout(function () {
        el.removeClass('has-error');
        el.removeClass('has-success');
        return blurred = false;
      }, 0, false);
    });

    return toggleClasses = function (invalid) {
      el.toggleClass('has-error', invalid);
      if (showSuccess) {
        return el.toggleClass('has-success', !invalid);
      }
    };
  };

  return {
    restrict: 'A',
    require: '^form',
    compile: function (elem, attrs) {
      if (!elem.hasClass('form-group')) {
        throw 'show-errors element does not have the \'form-group\' class';
      }
      return linkFn;
    }
  };
});

app.provider('showErrorsConfig', function () {
  var _showSuccess;
  _showSuccess = false;
  this.showSuccess = function (showSuccess) {
    return _showSuccess = showSuccess;
  };
  this.$get = function () {
    return { showSuccess: _showSuccess };
  };
});

app.config(['showErrorsConfigProvider', function(showErrorsConfigProvider) {
  showErrorsConfigProvider.showSuccess(true);
}]);

// CONTACT CONTROLLER
app.controller('contactController', function($scope, $http)
{
  $scope.page_title = 'Contact Me';
  $scope.page_subtitle = 'Have questions? I have answers (maybe).';

  $scope.phone_number = /^[0-9]+$/;
  $scope.email = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i;

  $scope.resultMessage;
  $scope.formData;
  $scope.loading = false;
  $scope.alert = false;

  // Contact on submit
  $scope.submit = function(contactform) {
    $scope.$broadcast('show-errors-check-validity');

    if ($scope.contactForm.$valid) {
      $scope.loading = true;
      $http({
        method: 'POST',
        url: 'mail/contact_me.php',
        data    : $.param($scope.formData),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(data){
        if(data.success) {
          $scope.resultMessage = data.message;
          $scope.alertClass = 'alert alert-success';
        } else {
          $scope.resultMessage = data.message;
          $scope.alertClass = 'alert alert-danger';
        }
        $scope.loading = false;
        $scope.alert = true;
        $scope.reset();
      });
    }
  };

  // Contact on reset
  $scope.reset = function() {
    $scope.$broadcast('show-errors-reset');
    $scope.formData = {};
  }
});
