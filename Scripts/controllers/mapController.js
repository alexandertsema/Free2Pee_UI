"use strict";
app.controller('mapController', function ($scope, $http, $window, $mdDialog, $mdToast, $timeout, progressService, $document, $q, NgMap) {

    var heatmap;

    NgMap.getMap().then(function (map) {

        // variables
        $scope.amountBathrooms = 30;
        $scope.zoom = 15;
        $scope.location = { latitude: 40.764998, longitude: -73.978804 };
        $scope.boundingBox = {};
        $scope.isBoundingBoxMode = false;
        var isHeatmapMode = true;
        var boundingBoxSize = 0.01;

        getLocation();

        $scope.getMarkers($scope.location, $scope.amountBathrooms);

        // events
        $scope.toggleHeatmap = function () {

            heatmap = $scope.map.heatmapLayers.heatmapLayer;

            if (isHeatmapMode) {

                $scope.zoom = 11;
                document.getElementById("heatMapButton").style.color = "#000000";
                document.getElementById("heatMapButton").style.fontWeight = "500";
                isHeatmapMode = false;
                $scope.markers = null;

                $scope.getHeatMapData();

                //heatmap.setMap($scope.map);

            } else {

                $scope.zoom = 15;
                document.getElementById("heatMapButton").style.color = "#565656";
                document.getElementById("heatMapButton").style.fontWeight = "400";
                isHeatmapMode = true;

                $scope.getMarkers($scope.location, $scope.amountBathrooms);

                heatmap.setMap(null);

                $scope.getCenter();
            } 
        };

        $scope.toggleBoundingBox = function () {

            if (!$scope.isBoundingBoxMode) {

                $scope.isBoundingBoxMode = true;
                $scope.markers = null;
                $scope.zoom = 13;

                document.getElementById("boundingBoxButton").style.color = "#000000";
                document.getElementById("boundingBoxButton").style.fontWeight = "500";

                getBounds();

                $scope.getTopRated($scope.boundingBox.northEastBound, $scope.boundingBox.southWestBound, $scope.amountBathrooms);

            } else {

                $scope.isBoundingBoxMode = false;

                $scope.zoom = 15;

                document.getElementById("boundingBoxButton").style.color = "#565656";
                document.getElementById("boundingBoxButton").style.fontWeight = "400";

                $scope.getMarkers($scope.location, $scope.amountBathrooms);

                $scope.getCenter();
            }
        };

        $scope.getCenter = function () {

            $scope.location.latitude = $scope.location.latitude - 0.0000000000001; // really dirty trick
            $scope.location.longitude = $scope.location.longitude - 0.0000000000001;
        }
        
        $scope.boundsChanged = function () {

            var northEastBound = { latitude: this.getBounds().getNorthEast().lat(), longitude: this.getBounds().getNorthEast().lng() };
            var southWestBound = { latitude: this.getBounds().getSouthWest().lat(), longitude: this.getBounds().getSouthWest().lng() };

            $scope.getTopRated(northEastBound, southWestBound, $scope.amountBathrooms);

            //$scope.getTopRated($scope.boundingBox.northEastBound, $scope.boundingBox.southWestBound, $scope.amountBathrooms);
        };

        $scope.markerMove = function (e) {

            $scope.location.latitude = e.latLng.lat();
            $scope.location.longitude = e.latLng.lng();

            $scope.getMarkers($scope.location, $scope.amountBathrooms);
        }

        $scope.showWindow = function (event, marker) {

            $scope.activeMarker = marker;
            $scope.map.showInfoWindow('info', this);
        };

        function getLocationSuccFn(position) {

            $scope.location = { latitude: position.coords.latitude, longitude: position.coords.longitude };

            $scope.getMarkers($scope.location, $scope.amountBathrooms);
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
        
        function getBounds() {

            var halfSize = boundingBoxSize / 2;

            $scope.boundingBox = {
                northEastBound:
                {
                    latitude: $scope.location.latitude - halfSize,
                    longitude: $scope.location.longitude - halfSize
                },
                southWestBound:
                {
                    latitude: $scope.location.latitude + halfSize,
                    longitude: $scope.location.longitude + halfSize
                }
            }
        }

    });


    $scope.getDirections = function () {

        $scope.map.hideInfoWindow('info', this);
        $scope.destination = { latitude: $scope.activeMarker.latitude, longitude: $scope.activeMarker.longitude };
    }

    // HTTP requests
    $scope.getTopRated = function (northEastBound, southWestBound, amountBathrooms) {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
            url: url + "bathroom",
            method: "GET",
            headers: {},
            params: {
                northEastBoundLatitude: northEastBound.latitude, northEastBoundLongitude: northEastBound.longitude,
                southWestBoundLatitude: southWestBound.latitude, southWestBoundLongitude: southWestBound.longitude,
                amountBathrooms: amountBathrooms
            }
        })
        .then(function (response) {

            if (!isEmpty(response.data)) {
                $scope.markers = response.data;
            }

            toast($mdToast, 'Here are ' + amountBathrooms + ' top rated bathrooms inside the bounding box!', 3000);
            resetProgress(progressService, timer, $timeout);

        }, function (response) {

            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }

    $scope.getMarkers = function (location, amountBathrooms) {

        if (amountBathrooms == 0) return;

        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
            url: url + "bathroom",
            method: "GET",
            headers: {  },
            params: { latitude: location.latitude, longitude: location.longitude, amountBathrooms: amountBathrooms }
        })
        .then(function (response) {

            toast($mdToast, 'Here are ' + amountBathrooms + ' bathrooms around you!', 3000);
            resetProgress(progressService, timer, $timeout);

            if (!isEmpty(response.data)) {
                $scope.markers = response.data;
            }

        }, function (response) {

            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }

    $scope.getHeatMapData = function () {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);
        $http({
            url: url + "bathroom",
            method: "GET"
        })
        .then(function (response) {

            if (!isEmpty(response.data)) {
                for (var i = 0; i < response.data.length; i++) {
                    heatmapdata.push(new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude));
                }
                heatmap.setMap($scope.map); //todo: avoid that trick
            }

            toast($mdToast, 'Here is the heatmap of all bathrooms!', 3000);
            resetProgress(progressService, timer, $timeout);

        }, function (response) {

            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }

    $scope.rateBathroom = function (id) {

        var timer = setProgress($timeout, $mdToast, progressService, 3000);

        $scope.activeMarker.upVotes++;

        $http({
            url: url + "vote",
            contenttype: "application/json",
            method: "PUT",
            headers: { },
            data: { id: id, upvote: true }
        })
        .then(function (response) {

            toast($mdToast, 'Thank you for feedback!', 3000);
            resetProgress(progressService, timer, $timeout);
            
        }, function (response) {

            $scope.activeMarker.upVotes--;

            resetProgress(progressService, timer, $timeout);
            Alert($mdDialog, 'ERROR', response.statusText);

        });
    }

});