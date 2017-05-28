var locations = [];

// Location constructor
function Location(value, index) {
	this.id = index;
	this.title = value.name;

	this.position = {};
	this.position.lat = value.location.lat;
	this.position.lng = value.location.lng;

	this.address = {};
	this.address.street = value.location.address || 'The address is unknown';
	this.address.city = value.location.city || 'Liverpool'; 
	//this.address.zipcode = value.address.zipcode || 'Unknown zip code';
	this.address.country = value.location.country || 'UK';

	this.foursquareProfileURL = 'https://foursquare.com/v/' + value.id;
	this.phone = value.contact.phone || '';
	this.displayPhone = value.contact.formattedPhone || 'No phone. Sorry ;(';
	this.website = value.url || 'No link. You better Google it';
	this.imageURL = value.image_url || 'img/pub-placeholder.jpg';
	this.rating = value.rating || 'No rating';
	this.priceRange = value.price || 'Who knows if it\'s pricey...';
	this.marker;
	this.isClicked = false;
};

//Link to Udacity's APIs course repo: https://github.com/udacity/ud864
function initMap() {
	//Initialize google maps
	var map;
	//That's the place where Anfield is
	var center = {
		lat: 53.430849,
		lng: -2.960862
	};

	//An array to hold 10 closest bars
	var markers = [];
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
					'<img src="' + 'img/anfield.jpg' + '" style="width: 300px">' + '<br><br>' +
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
		locations[i].marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			label: labels[labelIndex++ % labels.length],
			id: i,
			icon: 'img/beer.png'
		});

		// Push the marker to our array of markers.
		markers.push(locations[i].marker);

		// Create an onclick event to open an infowindow at each marker.
		locations[i].marker.addListener('click', function () {
			populateInfoWindow(this, largeInfowindow);
		});

		bounds.extend(markers[i].position);
	}



	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);
}

// This function helps to get a location from locations array by it's id
function getLocation(objArr, id) {
	for (var i = 0; i < objArr.length; i++) {
		if (objArr[i].id === id) {
			return objArr[i];
		}
	}
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
		//console.log(location);
		infowindow.setContent('<div><strong>' + marker.title + '</strong></div><br/>' +
			location.address.street + '<br>' +
			location.address.city + '<br>' +
			//location.address.zipcode + '<br>' +
			location.address.country + '<br>' +
			'<a href="' + location.foursquareProfileURL + '" target="_blank">Check this place out on Foursquare!</a><br>' +
			'Forsq rating: ' + location.rating + '<br>' +
			'Price: ' + location.priceRange +
			//'<br><br>' + 'Call here: <a href="tel:' + location.phone + '">' +location.displayPhone + '</a>' +
			'<br><br>' + '<img src="' + location.imageURL + '" style="width: 200px">');
		infowindow.open(map, marker);

		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function () {
			infowindow.close();
			//infowindow.setMarker = null;
		});
	}
}

//Knockout's viewmodel
function AppViewModel() {
	var self = this;

	self.myPubs = ko.observableArray([]);


	//Working around foursquare api
	var client_id = 'ZRZOYO5I4TD5PDUZZOOQ4UNAVORKVMQJJDM5S4YUBNFHD05C';
	var client_secret = 'LDAYVFPBDALCUPTK1DBDSZC4XF5AHGG1I5IWOTSNI4YW1WXT';
	//var apiURL = 'https://api.foursquare.com/v2/venues/';
	var placeId = '4baf7f4ff964a520bd043ce3';
	//var foursquareURL = apiURL + placeId + '?client_id=' + client_id +  '&client_secret=' + client_secret +'&v=' + foursquareVersion;
	//var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20130815&ll=53.430849,-2.960862&query=beer';
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20130815&ll=53.430849,-2.960862&query=pub';

	function loadJSON(callback) {

		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', foursquareURL, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {

				// Required use of an anonymous callback as .open 
				// will NOT return a value but simply returns undefined 
				// in asynchronous mode
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	}
	loadJSON(function (response) {

		// Parse JSON string into array of objects
		var results = JSON.parse(response).response.venues;
		console.log(JSON.parse(response));
		console.log(results);
		for (var i = 0; i < results.length; i++) {
			self.myPubs.push(new Location(results[i], i));
		}

	});
	locations = self.myPubs();
	self.inputField = ko.observable('');

	// This observable is a need. When you put the cursor into the input field
	// it makes list of titles visible and hides them when cursor is off.
	self.isSelected = ko.observable(false);
	//self.setIsSelected = function() {
	//	self.isSelected(true)
	//};

	// Now let's try to implement filtering
	self.filteredItems = ko.computed(function () {
		if (self.inputField().length > 0) {
			var optionsArr = self.myPubs();
			return ko.utils.arrayFilter(optionsArr, function (item) {
				var chosenItem = item.title.toLowerCase().indexOf(self.inputField().toLowerCase()) > -1;
				if (!chosenItem) {
					item.marker.setVisible(false);
				} else {
					item.marker.setVisible(true);
				}

				return chosenItem;
			});
		} else {
			return self.myPubs();
		}
	});

	self.liSelected = ko.observable();

	self.resetClicks = function (arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i].isClicked = false;
		}
	};

	self.isClickedToggle = function (item, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id !== item.id) {
				arr[i].isClicked = false;
			}
		}
		if (!item.isClicked) {
			item.isClicked = true;

		} else {
			item.isClicked = false;
		}

	}

	self.activateMarker = function (item) {
		self.isClickedToggle(item, locations);
		self.liSelected(item.title);

		if (item.isClicked) {
			// populateInfoWindow(item.marker, infowindow);

			// This is a trigger. It activates smth inside google maps init function 
			// by being used outside of it... awesome feature
			google.maps.event.trigger(item.marker, 'click');
		}
	};


}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

// A bit of javascript to hide list when it's item is clicked if the screen is narrow
if (window.innerWidth < 720) {
	var list = document.getElementById('list-view');
	var inputField = document.getElementById('search-input');

	inputField.addEventListener('click', function () {
		list.style.display = 'block';
	});

	list.addEventListener('click', function () {
		list.style.display = 'none';
	});
}