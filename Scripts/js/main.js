function Alert($mdDialog, title, content, ev) {
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title(title)
        .textContent(content)
        .ok('OK')
        .targetEvent(ev)
    );
}

function setProgress($timeout, $mdToast, progressService, timeout) {
    progressService.setProgress(true);
    var timer = $timeout(function () {
        progressService.setShield(true);
        $timeout(function() {
            toast($mdToast, 'The request takes longer than expected. Please wait.', 5000);
        }, 1000);
    }, timeout);

    return timer;
}

function toast($mdToast, message, hideDelay) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position("bottom right")
        .hideDelay(hideDelay)
        .parent(document.getElementById('toast-container'))
    );
}

function resetProgress(progressService, timer, $timeout) {
    $timeout.cancel(timer);
    progressService.setShield(false);
    progressService.setProgress(false);
}

function isEmpty(obj) {
    return (obj == null || Object.getOwnPropertyNames(obj).length === 0);
};