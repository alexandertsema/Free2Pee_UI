app.controller('progressController', function ($scope, progressService) {
    $scope.progress = progressService.getProgress;
    $scope.shield = progressService.getShield;
});