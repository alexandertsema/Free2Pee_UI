"use strict";
app.controller('markersController', function ($scope, $http, $window, $mdDialog, $mdToast, $timeout, progressService, $document, NgMap) {

    NgMap.getMap().then(function (map) {

        $scope.location = { latitude: 40.764998, longitude: -73.978804 };

        getLocation();

        bindMarkers($scope.location);

        $scope.markerMove = function (e) {

            $scope.location.latitude = e.latLng.lat();
            $scope.location.longitude = e.latLng.lng();

            map.center.latitude = $scope.location[0];
            map.center.longitude = $scope.location[1];

            $scope.$apply();
        }

        $scope.showWindow = function (event, marker) {

            $scope.activeMarker = marker;
            $scope.map.showInfoWindow('info', this);
        };

        function getLocationSuccFn(position) {

            map.center.latitude = position.coords.latitude;
            map.center.longitude = position.coords.longitude;

            $scope.location = { latitude: position.coords.latitude, longitude: position.coords.longitude };

            $scope.$apply();
        }

        function getLocationErrFn(error) {

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    Alert($mdDialog, "Error", "User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    Alert($mdDialog, "Error", "Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    Alert($mdDialog, "Error", "The request to get user location timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    Alert($mdDialog, "Error", "An unknown error occurred.");
                    break;
            }
        }

        function getLocation() {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(getLocationSuccFn, getLocationErrFn, { enableHighAccuracy: true, timeout: 10000 });
            }
        }
    });

    $scope.rateBathroom = function (id) {

        putRating(id);
    };

    $scope.getDirections = function () {

        $scope.destination = [$scope.activeMarker.latitude, $scope.activeMarker.longitude];
    }

    function bindMarkers(location) {

        var markers = getMarkers(location);
        if (!isEmpty(markers)) {
            $scope.markers = markers;
        }
    }

    function getMarkers(location) {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
            url: "/api/markers/",
            method: "GET",
            params: { location: location }
        })
        .then(function (response) {

            //success bind markers
            toast($mdToast, 'Here are some bathroom around you!', 3000);
            resetProgress(progressService, timer, $timeout);
            return response.data;

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
        //mock. remove in production
        return [
                    { id: 0, name: '227 Street Playground', location: 'Bronx Boulevard between East 226 and East 228 streets', image: 'Content/img/public-restroom.jpg', openYearRound: 'No', handicap: 'Yes', comments: 'Currently closed', rating: 2, latitude: 40.783857, longitude: -73.975964 },
                    { id: 2, name: 'Alfred E. Smith Park', location: 'Catherine Slip, Madison & South streets', image: 'Content/img/public-restroom2.jpg', openYearRound: 'Yes', handicap: 'No', comments: 'No soap', rating: 4, latitude: 40.780719, longitude: -73.986958 }
                ];
    }

    function putRating(id) {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $scope.activeMarker.rating++;
        $http({
            url: "/api/markers/",
            method: "PUT",
            params: { id: id }
        })
        .then(function (response) {

            //success bind markers
            toast($mdToast, 'Thank you for feedback!', 3000);
            resetProgress(progressService, timer, $timeout);
            return response.data;

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }
});