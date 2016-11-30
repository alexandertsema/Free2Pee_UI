"use strict";
app.controller('markersController', function ($scope, $http, $window, $mdDialog, $mdToast, $timeout, progressService, $document, NgMap) {
    var heatmap, vm = this;
    NgMap.getMap().then(function (map) {
        vm.map = map;
        console.log("set up heatmap");
        heatmap = vm.map.heatmapLayers.foo;	
        console.log("set up heatmap");
        vm.toggleHeatmap= function(event) {
            heatmap.setMap(heatmap.getMap() ? null : vm.map);
        };
			
        $scope.amountBathrooms = 30;
        $scope.location = { latitude: 40.764998, longitude: -73.978804 };

        getLocation();
        
        $scope.getMarkers($scope.location, $scope.amountBathrooms);

        $scope.getHeatData();

        $scope.markerMove = function (e) {

            $scope.location.latitude = e.latLng.lat();
            $scope.location.longitude = e.latLng.lng();

            map.center.latitude = $scope.location[0];
            map.center.longitude = $scope.location[1];

            $scope.getMarkers($scope.location, $scope.amountBathrooms);

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
            $scope.getMarkers($scope.location, $scope.amountBathrooms);

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

    $scope.getHeatData = function() {
        console.log("in toggle");
        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
            url: url + "bathroom",
            method: "GET",
            headers: {  },
            params: {  }
        })
        .then(function (response) {

            //success bind markers
            //toast($mdToast, 'Here is the heatmap!', 3000);
            //resetProgress(progressService, timer, $timeout);

            if (!isEmpty(response.data)) {
            	var arr = response.data.map(function(v) {
            		return new google.maps.LatLng( v.latitude, v.longitude );
            	});

            	$scope.heatmapdata = arr;
            	$scope.heatmapdata = [new google.maps.LatLng(40.8322387, -73.8809968), 
            		new google.maps.LatLng(40.7127837, -74.0059413)];
            	console.log("got data");
            		//here i modify it
            }

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }

    $scope.getDirections = function () {

        $scope.map.hideInfoWindow('info', this);
        $scope.destination = { latitude: $scope.activeMarker.latitude, longitude: $scope.activeMarker.longitude };
    }

    $scope.getMarkers = function (location, amountBathrooms) {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
            url: url + "bathroom",
            method: "GET",
            headers: {  },
            params: { latitude: location.latitude, longitude: location.longitude, amountBathrooms: amountBathrooms }
        })
        .then(function (response) {

            //success bind markers
            toast($mdToast, 'Here are ' + amountBathrooms + ' bathrooms around you!', 3000);
            resetProgress(progressService, timer, $timeout);

            if (!isEmpty(response.data)) {
                $scope.markers = response.data;
            }

        }, function (response) {

            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }

    $scope.rateBathroom = function (id) {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);

        $scope.activeMarker.rating++;

        $http({
            url: url + "vote",
            method: "PUT",
            data: { id: id }
        })
        .then(function (response) {

            //success
            toast($mdToast, 'Thank you for feedback!', 3000);
            resetProgress(progressService, timer, $timeout);
            
        }, function (response) {

            $scope.activeMarker.rating--;
            //error alert user
            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }
});