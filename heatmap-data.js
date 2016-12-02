var heatmapdata = [];

getHeatData();

function getHeatData() {
   
    var xmlhttp = new XMLHttpRequest();
    var url = 'http://webgis20161127031804.azurewebsites.net/api/Bathroom';

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {

                var resData = JSON.parse(xmlhttp.responseText);

                for (var i = 0; i < resData.length; i++) { 
			     heatmapdata.push( new google.maps.LatLng( resData[i].latitude, resData[i].longitude ));
            	}
            	console.log("Got heatmapdata");
           }
           else if (xmlhttp.status == 400) {
              alert('There was an error 400');
           }
           else {
               alert('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}





