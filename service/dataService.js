angular.module('eventsApp').service('dataService', ['$interval', '$log', '$http', function ($interval, $log, $http) {
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var labelIndex = 0;
    var infowindow;
    var markerClusterer = null;
    var heatmap = null;
    var locations = [];
    var markerArray = [];
    var markers = [];
    var self = this;


    //api call from external to get details 
    this.getPlaceDetails = function () {
        $http.get("place.json")
            .then(function (response) {
                self.LatLog = response;
                console.log("response", response);
            });
    };

    // loading map with centre value
    this.initGoogle = function (callback) {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(geotPosition, locationError);
        var currentPosition = new google.maps.LatLng(19.112554, 72.893261)
        var options = {
            center: currentPosition,
            zoom: 2,
            // maxZoom: 22,
            minZoom: 3,
            disableDefaultUI: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            // mapTypeId: 'satellite'
            mapTypeId: google.maps.MapTypeId.ROADMAP
            // scrollwheel: false,
            // draggable: true
        };

        infowindow = new google.maps.InfoWindow();
        var map = new google.maps.Map(document.getElementById("map"), options);
        console.log('infowindow', infowindow);
        callback(null, map)
    }

    // creating array of markers based on lat,lng of position
    this.createMarker = function (mode,mapObject) {
        locations = [];
        var latLogData = self.LatLog.data;
        if (markerArray.length === 0) {
            for (var i = 0; i < latLogData.length; i++) {
                locations.push(new google.maps.LatLng(latLogData[i].lat, latLogData[i].lng));
            }
            updateMarker(mode,mapObject);
        }
    }

    // create cluster based on arry of markers
    function updateMarker(mode,mapObject) {
        markers = [];
        if (locations.length > 0) {
            markers = locations.map(function (location) {
                return new google.maps.Marker({
                    position: location,
                    optimized: false,
                    draggable: false,
                    title: "Place Title!",
                    // animation: google.maps.Animation.DROP,
                    // zIndex: 10
                    icon: './assets/image/marker01.png'
                });
            });
        }
        markerArray = markers;
        self.mapLayering(mode, mapObject)    
    }

    this.mapLayering = function (mode, mapObject){
        // cluster limit is 2040 marker
        if (mode.type === 'HEATMAP'){
            if (markerClusterer)
                markerClusterer.clearMarkers();
            // heatmap.setMap(heatmap.getMap() ? null : mapObject);
            if (heatmap && !heatmap.getMap())
            heatmap.setMap(mapObject)
            if (heatmap == null && locations.length > 0 && mapObject){
                heatmap = new google.maps.visualization.HeatmapLayer({
                    data: locations,
                    map: mapObject
                });
            }
        } 

        if (mode.type === 'CLUSTER'){
            if (heatmap && heatmap.getMap())
            heatmap.setMap(null)
            if (markerClusterer == null && mapObject && markers.length) {
                markerClusterer = new MarkerClusterer(mapObject, markers, {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
                });
            }
        }
    }

    // erasing marker data from map
    this.eraseMarker = function (mapObject) {
        if (markerClusterer)
             markerClusterer.clearMarkers();
        if(heatmap)
            heatmap.setMap(null);
        // angular.forEach(self.markerArray, function (value) {
        //     value.setMap(null);
        // });
        heatmap = null;
        markerClusterer = null;
        markers = [];
        markerArray = [];
        locations = [];
    }

    function locationError() {
        console.log("error in fetching current Location")
    }

    function geotPosition(position) {
        console.log("current position", position);
    }





    this.manualSearchNearBy = function (service, textSearch) {
        if (self.markerArray.length > 0) {
            self.eraseMarker();
            self.markerArray = [];
        }
        if (textSearch) {
            var request = {
                location: new google.maps.LatLng(19.111952, 72.892873),
                radius: '1000',
                query: textSearch.toString()
            }
            self.setNearBy(service, request)
        }
    };

    // creating a boundery from the centre point
    this.setNearBy = function (service, request) {
        service.textSearch(request, callback);
    }

    //create marker object based on position
    function createMarkers(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: self.map,
            title: place.name,
            position: place.geometry.location
        });
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
        self.markerArray.push(marker);
    }

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                console.log("place", place);
                createMarkers(results[i]);
            }
        }
    }

}]);