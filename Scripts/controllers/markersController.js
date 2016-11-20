app.controller('markersController', function ($scope, $http, $window, $mdDialog, $mdToast, $timeout, progressService, uiGmapGoogleMapApi, $document) {

    uiGmapGoogleMapApi.then(function (map) {
        getLocation();
        bindMarkers($scope.position.coords);
    });

    $scope.map = {
        show: true,
        center: {
            latitude: 40.778063,
            longitude: -73.970085
        },
        control: {},
        zoom: 15,
        options: {
            streetViewControl: true
        }
    };

    var markerEvents = {
        dragend: function (marker, eventName, args) {
            $scope.marker.options = {
                draggable: true,
                labelContent: "lat: " +
                    $scope.marker.coords.lat +
                    ' ' +
                    'lon: ' +
                    $scope.marker.coords.lng,
                labelAnchor: "100 0",
                labelClass: "marker-labels"
            };
        }
    }
    $scope.position = {
        id: 0,
        coords: {
            latitude: 40.778063,
            longitude: -73.970085
        },
        options: { draggable: true },
        events: markerEvents
    };
    $scope.markers = [];
    
    $scope.getDirections = function () {

        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();
        directionsDisplay.setMap(null);
        directionsDisplay.setPanel(null);

        $scope.directions = {
            origin: { lat: $scope.position.coords.latitude, lng: $scope.position.coords.longitude },
            destination: { lat: 40.780719, lng: -73.986958 },
            showList: false
        }

        var request = {
            origin: $scope.directions.origin,
            destination: $scope.directions.destination,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        directionsService.route(request, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                
                directionsDisplay.setDirections(response);
                directionsDisplay.setMap($scope.map.control.getGMap());
                directionsDisplay.setPanel(document.getElementById('directionsList'));
                $scope.directions.showList = true;
            } else {
                Alert($mdDialog, "Error", "Sorry, we can't build its route!");
            }
        });
    }
    

    function getLocationSuccFn(position) {

        $scope.map.center.latitude = position.coords.latitude;
        $scope.map.center.longitude = position.coords.longitude;
        $scope.position.coords.latitude = position.coords.latitude;
        $scope.position.coords.longitude = position.coords.longitude;
        $scope.map.control.refresh({ latitude: $scope.map.center.latitude, longitude: $scope.map.center.longitude });
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

    function bindMarkers(location) {
        //var markers = getMarkers(location);
        // mock markers
        var markers = [
                        { id: 0, latitude: 40.783857, longitude: -73.975964 },
                        { id: 1, latitude: 40.781818, longitude: -73.979322 },
                        { id: 2, latitude: 40.780719, longitude: -73.986958 }
                    ];
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

            return response.data;

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }
});