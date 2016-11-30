App.controller('myctrl', ['$scope', '$stateParams','$filter',function($scope,$stateParams,$filter) {

//extracting id given in url
  $scope.pid = $stateParams.pid;
  console.log($scope.pid);
  $scope.getNumber = function(num) {
         return new Array(num);
     };
    $scope.myNumber = 5;


  //creating data for reviews
var data = [{
  id: 1,
  reviews:[{
    title: 'Awesome',
    comment: 'no comments',
    usefulness: 90,
    reviewerName: 'abc',
    connection_level : 3,
    ratings:4,
    d_time: 8,
    other: 'thanku'
  },{
    title: 'Cool',
    comment:'no comments',
    usefulness: 5,
    reviewerName: 'def',
    connection_level : 7,
    ratings:4,
    d_time: 5,
    other: 'thanku'
  },{
    title: 'Lovely',
    comment: 'no comments',
    usefulness: 3,
    reviewerName: 'ghi',
    connection_level : 6,
    ratings:1,
    d_time: 4,
    other: 'thanku'
  },{
    title: 'Beautiful',
    comment: 'no comments',
    usefulness: 2,
    reviewerName: 'jkl',
    connection_level : 8,
    ratings:2,
    d_time: 3,
    other: 'thanku'
  },{
    title: 'gorgeous',
    comment:  'no comments',
    usefulness: '4',
    reviewerName:'mno',
    connection_level : 5,
    ratings:3,
    d_time: 25,
    other: 'thanku'
  },{
    title: 'excellent',
    comment:  'no comments',
    usefulness: 3,
    reviewerName:'pqr',
    connection_level : 8,
    ratings:4,
    d_time: 3,
    other: 'thanku'
  },{
    title: 'marvellous',
    comment:  'no comments',
    usefulness: 4,
    reviewerName:'stu',
    connection_level : 3,
    ratings:1,
    d_time: 5,
    other: 'thanku'
  },{
    title: 'sweet',
    comment: 'no comments',
    usefulness: 2,
    reviewerName:'vwx',
    connection_level : 7,
    ratings:2,
    d_time: 2,
    other: 'thanku'
  }]
},
{
  id: 2,
  reviews:[{
    title: 'gorgeous',
    comment:  'no comments',
    usefulness: '4',
    reviewerName:'mno',
    connection_level : 5,
    ratings:3,
    d_time: 25,
    other: 'thanku'
  },{
    title: 'excellent',
    comment:  'no comments',
    usefulness: 3,
    reviewerName:'pqr',
    connection_level : 8,
    ratings:4,
    d_time: 3,
    other: 'thanku'
  },{
    title: 'marvellous',
    comment:  'no comments',
    usefulness: 4,
    reviewerName:'stu',
    connection_level : 3,
    ratings:1,
    d_time: 5,
    other: 'thanku'
  },{
    title: 'sweet',
    comment: 'no comments',
    usefulness: 2,
    reviewerName:'vwx',
    connection_level : 7,
    ratings:2,
    d_time: 2,
    other: 'thanku'
  },{
    title: 'Awesome',
    comment: 'no comments',
    usefulness: 90,
    reviewerName: 'abc',
    connection_level : 3,
    ratings:4,
    d_time: 8,
    other: 'thanku'
  },{
    title: 'Cool',
    comment:'no comments',
    usefulness: 5,
    reviewerName: 'def',
    connection_level : 7,
    ratings:4,
    d_time: 5,
    other: 'thanku'
  },{
    title: 'Lovely',
    comment: 'no comments',
    usefulness: 3,
    reviewerName: 'ghi',
    connection_level : 6,
    ratings:1,
    d_time: 4,
    other: 'thanku'
  },{
    title: 'Beautiful',
    comment: 'no comments',
    usefulness: 2,
    reviewerName: 'jkl',
    connection_level : 8,
    ratings:2,
    d_time: 3,
    other: 'thanku'
  }]
}];

//result according to product id in url
for(var key in data){

  if(data[key].id == $scope.pid){
    $scope.mydata = data[key].reviews;

  }
}

//////////////////////////////////////////////////////////////////////////////////////////
//Creating pagination in the APP
$scope.currentPage = 0;
$scope.pageSize = 3;
$scope.q = '';

$scope.getData = function () {
  return $filter('filter')($scope.mydata, $scope.q)
}

$scope.numberOfPages=function(){
    return Math.ceil($scope.getData().length/$scope.pageSize);
}
/////////////////////////////////////////////////////////////////////////////////////////////


}]);

//filter for pagination
App.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
