app.filter('booleanFilter', function () {

    return function (x) {

        if (x)
            return 'Yes';
        else
            return 'No';
    };

});