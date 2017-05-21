//Link to Udacity's APIs course repo: https://github.com/udacity/ud864
//Initialize google maps
var map;
//THat's the place where Anfield is
var center = {
	lat: 53.430849,
	lng: -2.960862
};

//An array to hold 10 closest bars
var markers = [];


//This code was generted from Yelp's Fusion API on a SERVER side. So to make stuff work here, 
//on the client side I just too the generated array of objects and wwill use it further in my project
var locations = [];
for (let i = 0; i < results.length; i++) {
	var result = results[i];
	var place = {
		id: i,
		title: result.name,
		position: {
			lat: result.coordinates.latitude,
			lng: result.coordinates.longitude
		},
		address: {
			street: result.location.address1,
			city: result.location.city,
			zipcode: result.location.zip_code,
			country: result.location.country
		},
		yelpProfileURL: result.url,
		phone: result.phone,
		displayPhone: result.display_phone,
		website: '',
		imageURL: '',
		rating: result.rating,
		priceRange: ''
	};

	if (result.image_url) {
		place.imageURL = result.image_url;
	} else {
		place.imageURL = 'img/pub-placeholder.jpg';
	};

	if (result.price) {
		place.priceRange = result.price;
	} else {
		place.priceRange = 'who knows if it\'s pricey...';
	}
	locations.push(place);
}

function initMap() {

	// Create a map object and specify the DOM element for display.
	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		scrollwheel: false,
		zoom: 15,
		draggable: true
	});

	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	//Let's first create a marker for the man place - the stadium
	var markerStadium = new google.maps.Marker({
		map: map,
		position: center,
		title: 'Anfield Road',
		animation: google.maps.Animation.DROP,
		icon: 'img/lfc-icon.png'
	});
	// To add the marker to the map, call setMap();
	markerStadium.setMap(map);
    
	var infowindow = new google.maps.InfoWindow({
		content: 'Anfield Road'
	});
	var service = new google.maps.places.PlacesService(map);
	service.getDetails({
		placeId: 'ChIJi1MCS2Uhe0gR_3MZ4ldqV4Q'
	}, function (place, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			google.maps.event.addListener(markerStadium, 'click', function () {
				infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
					'Place ID: ' + place.place_id + '<br><br>' +
					place.formatted_address + '</div>');
				infowindow.open(map, this);
			});
		}
	});


	markerStadium.addListener('click', function () {
		infowindow.open(map, markerStadium);
	});


	var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var labelIndex = 0;
	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.

		var position = locations[i].position;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			label: labels[labelIndex++ % labels.length],
			id: i,
			icon: 'img/beer.png'
		});
		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function () {
			populateInfoWindow(this, largeInfowindow);
		});
		bounds.extend(markers[i].position);
	}
	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		var id = marker.id;
		var location = getLocation(locations, id);
		console.log(location);
		infowindow.setContent('<div><strong>' + marker.title + '</strong></div><br/>' +
			location.address.street + '<br>' +
			location.address.city + '<br>' +
			location.address.zipcode + '<br>' +
			location.address.country + '<br>' +
			'<a href="' + location.yelpProfileURL + '">Check this place out on Yelp!</a><br>' +
			'Yelp! rating: ' + location.rating + '<br>' +
			'Price: ' + location.priceRange +
			'<br><br>' + 'Call here: <a href="tel:' + location.phone + '">' +
			location.displayPhone + '</a>' + '<br><br>' + '<img src="' + location.imageURL + '" style="width: 200px">');
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function () {
			infowindow.setMarker = null;
		});
	}
}

function getLocation(objArr, id) {
	for (var i = 0; i < objArr.length; i++) {
		if (objArr[i].id === id) {
			return objArr[i];
		}
	}
}



function AppViewModel() {
    var self = this;
	self.suggestions = ko.observableArray([]);
	
	self.inputField = ko.observable('');
	
	for (var i = 0; i < locations.length; i++){
		var option = ko.observable();
		option = locations[i].title;
		
		self.suggestions().push(option);
		
	}
	
	self.inputField = ko.observable('');
	
	self.filteredItems = ko.computed(function() {
		var filter = self.inputField().toLowerCase();
		if (!filter) {
			return self.suggestions();
		} else {
			return ko.utils.arrayFilter(self.suggestions(), function(item) {
				return ko.utils.stringStartsWith(item.toLowerCase(), filter);
			});
		}
	}, self);
	
}
ko.applyBindings(new AppViewModel());
