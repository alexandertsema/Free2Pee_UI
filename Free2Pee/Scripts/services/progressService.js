app.service('progressService', function () {

    var progress = false;
    var shield = false;

    return {
        getProgress: function () {
            return progress;
        },
        setProgress: function (value) {
            progress = value;
        },

        getShield: function () {
            return shield;
        },
        setShield: function (value) {
            shield = value;
        }
    }
});