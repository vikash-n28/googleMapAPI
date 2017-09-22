angular.module('eventsApp').controller('control', ['$scope','dataService', function ($scope,dataService) { 
    var map;
    var mapObject;
    var service;
    $scope.deleteDisabled = true;
    $scope.createDisabled = false;
    $scope.type = [{type:'CLUSTER',id:1},{type:'HEATMAP',id:2}];
    $scope.defaultRadio = $scope.type[0];
    // get array of object of attribute latitude & longitude
    $scope.initialize = function(){
        dataService.getPlaceDetails();
        dataService.initGoogle(function(error,map){
            mapObject = map;
            // service = new google.maps.places.PlacesService(map);
        })
    };

    // on click create marker from array
    $scope.createMark = function (){
        var searchPlace = 'atm';
        $scope.deleteDisabled =false;
        $scope.createDisabled = true;
        dataService.createMarker($scope.defaultRadio,mapObject);
        // dataService.manualSearchNearBy(service, searchPlace);
    };
   
    //on click erase all marker
    $scope.deleteMark = function (){
        $scope.deleteDisabled = true;
        $scope.createDisabled = false;
        dataService.eraseMarker(mapObject)
    }

    $scope.manualSearch = function (searchPlace){
        dataService.manualSearchNearBy(service,searchPlace);
    }

    $scope.mapLayering = function(event){
        $scope.defaultRadio = event;
        dataService.mapLayering(event,mapObject);
    }

}]);

