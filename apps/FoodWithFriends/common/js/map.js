//function wlCommonInit(){
//  /*
//   * Use of WL.Client.connect() API before any connectivity to a Worklight Server is required. 
//   * This API should be called only once, before any other WL.Client methods that communicate with the Worklight Server.
//   * Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
//   *    
//   *    WL.Client.connect({
//   *        onSuccess: onConnectSuccess,
//   *        onFailure: onConnectFailure
//   *    });
//   *     
//   */
//  
//  // Common initialization code goes here
//  
//}

function loadMap() {
//  WL.Logger.debug("Is logging something.");
  
  //GPS tracking
//  var policy = {
//      Geo: WL.Device.Geo.Profiles.LiveTracking()
//  }
//  WL.Device.startAcquisition(policy, triggers, onFailure);
  
  
  WL.Device.Geo.acquirePosition(initialize, null, {
    timeout : 30000,
    enableHighAccuracy : true,
    maximumAge : 15000
  });
}

function initialize(position) {
//  geocoder = new google.maps.Geocoder();
  var map;
  
  if (this.map == null) {
    var center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
        zoom : 8, // zoom level
        center: center,
        panControl : true,
        zoomControl : true,
        scaleControl : true,
        mapTypeId : google.maps.MapTypeId.ROADMAP
      }
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  }
//  google.maps.event.addListener(map, 'click', function(event) {
//    marker = new google.maps.Marker({
//      position : event.latLng,
//      map : map
//    });
//  });
  
}

function onLocationSuccess(position) {
  console.log("onLocationSuccess. Latitude is:" + position.coords.latitude + " Longitude is:" + position.coords.longitude);
}
function onLocationError(error) {
  console.log("Error occured. Code is:" + error.code);
}

$(document).on("click", "#map_canvas", function() {
  $(".search-results").hide();
  return false;
});

$(document).on("click", ".search-wrapper .btnSearch", function() {
  //TODO add google places search stuff here and refactor this to a different js file
//  var url = "https://maps.googleapis.com/maps/api/place/search/json?key=AIzaSyDEG-PC6Vao82A9EtWvgiXRLVZ1k5X9RVQ"
//    + "&radius=200&location=";
//  WL.Device.Geo.acquirePosition(function(position) {
//    url = url + position.coords.latitude+","+position.coords.longitude;
//    
//    $.getJSON(url, function(results) {
//      $(results).each(function (id, result) {
//        WL.Logger.debug(id + " " + result);
//      });
//    });
//  }, null, {
//    timeout : 30000,
//    enableHighAccuracy : true,
//    maximumAge : 15000
//  });
  WL.Device.Geo.acquirePosition(function(position) {
    var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var request = {
      location: coords,
      radius: '200',
      type: 'restaurant'
    };
    
    var mapOptions = {
        zoom : 8, // zoom level
        center: coords,
        panControl : true,
        zoomControl : true,
        scaleControl : true,
        mapTypeId : google.maps.MapTypeId.ROADMAP
      }
    
    service = new google.maps.places.PlacesService(document.getElementById("map_canvas"), mapOptions);
    service.nearbySearch(request, function(results) {
      var places = [];
      $(results).each(function (id, result) {
        
        WL.Logger.debug(id + " " + result);
        var lat1 = result.geometry.location.lat();
        var lat2 = position.coords.latitude;
        var dlon = position.coords.longitude-result.geometry.location.lng();
        var dlat = lat2-lat1;
        var a = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = 3961 * c;
        
        places.push({'name':result.name, 'distance':round(d)});
        
      });
      map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      
      places.sort(function(a, b) {return a.distance - b.distance});
      
      var resultsHtml = "";
      var lastIndex = places.length-1;
      $.each(places, function(index, place) {
        var lastElementClass = "";
        if (index == lastIndex) {
          lastElementClass = " lastElement";
        }
        resultsHtml += "<div class='place"+lastElementClass+"'>" +
          "<div class='name'>"+place.name+"</div>" +
          "<div class='distance'>"+place.distance+" miles</div>" +  
          "</div>";
      });
      
      $("body .search-results").html(resultsHtml).show();
    });
  });
});

//round to the nearest 1/1000
function round(x) {
  return Math.round( x * 1000) / 1000;
}

