app.controller('indexController', function ($scope, $http, $window, $mdDialog, $mdToast, $timeout, progressService) {
    
    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    //get request
    /*$scope.BindMarkers = function () {
        
        var markers = getMarkers(location);
        if(!isEmpty(markers)){

        }
    }
    function getMarkers(location){
        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
        url: "/api/markers/",
        method: "GET",
        params: { location: location }
        })
        .then(function (response) {
            //success bind markers
            
            toast($mdToast, 'Here are some bathroom around you!', 3000);

            return response.data;

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }*/
});