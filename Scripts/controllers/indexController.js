app.controller('indexController', function ($scope, $http, $window, $mdDialog, $mdToast, $timeout, progressService) {
    
    $scope.test = "MAP GOES HERE";

    //get request
    $scope.Generate = function () {
        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $scope.acceptBtn = false;

        $http({
            url: "./api/detailedreport",
            method: "GET",
            headers: getHeaders(),
            params: { userName: $scope.user.Login, fromDateTime: $scope.fromDateTime }
        })
        .then(function (response) {
            //success bind markers
            toast($mdToast, 'Your report is generated!', 3000);

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);
        });
    }
});