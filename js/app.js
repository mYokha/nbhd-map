// Location constructor
function Location(value, index) {
	
	// This is for my own usage
	this.id = index;
	
	// Those are the options Foursquare returns for sure
	
	// id
	this.venueId = value.id;
	
	// name
	this.title = value.name;

	// contact
	this.phone = value.contact.phone || '';
	this.formattedPhone = value.contact.formattedPhone || 'No phone. Sorry ;(';
	
	// location
	this.position = {
		lat: value.location.lat,
		lng: value.location.lng
	};

	this.address = {
		street: value.location.address || 'The address is unknown',
		city: value.location.city || 'Liverpool',
		country: value.location.country || 'UK'
	};
	
	this.distance = value.location.distance;
	
	// verified foursquare account
	this.verified = value.verified ? 'Yes' : 'No';
	
	this.foursquareProfileURL = 'https://foursquare.com/v/' + value.id;
	
	this.website = value.url || 'No link. You better Google it';
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

	var infowindow = new google.maps.InfoWindow();
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
	for (var i = 0; i < appViewModel.myPubs().length; i++) {

		// Get the position from the location array.
		var position = appViewModel.myPubs()[i].position;
		var title = appViewModel.myPubs()[i].title;


		// Create a marker per location, and put into markers array.
		appViewModel.myPubs()[i].marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			label: labels[labelIndex++ % labels.length],
			id: i,
			icon: 'img/beer.png'
		});

		// Create an onclick event to open an infowindow at each marker.
		appViewModel.myPubs()[i].marker.addListener('click', function () {
			populateInfoWindow(this, largeInfowindow);
		});

		bounds.extend(appViewModel.myPubs()[i].position);
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
		var location = getLocation(appViewModel.myPubs(), id);
		infowindow.setContent('<span class="info-heading">Title:</span> ' + marker.title + '<br><br>' +
							  '<span class="info-heading">Venue ID:</span> ' + location.venueId	+ '<br><br>' +
							  '<span class="info-heading">Phone:</span> <a href="tel:' + location.phone + '">' + location.formattedPhone + '</a>' + '<br><br>' +
							  '<span class="info-heading">Address:</span> '+'<br>' +
							  location.address.street + '<br>' +
							  location.address.city + '<br>' +
							  location.address.country + '<br><br>' +
							  '<span class="info-heading">Distance to Anfield:</span> ' + location.distance + 'm<br><br>' +
							  '<span class="info-heading">Verified Foursquare account:</span> ' + location.verified + '<br><br>' +
							  '<a href="' + location.foursquareProfileURL + '" target="_blank">Foursquare profile link</a><br><br>');
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
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20130815&ll=53.430849,-2.960862&&radius=3000&categoryId=4bf58dd8d48988d155941735,52e81612bcbc57f1066b7a06,4bf58dd8d48988d11b941735';

	function loadJSON(callback) {

		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', foursquareURL, false);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {

				// Required use of an anonymous callback as .open 
				// will NOT return a value but simply returns undefined 
				// in asynchronous mode
				callback(xobj.responseText);
			}
		}
		xobj.send(null);
	}
	loadJSON(function (response) {

		// Parse JSON string into array of objects
		var results = JSON.parse(response).response.venues;
		

		for (var i = 0; i < results.length; i++) {
			self.myPubs.push(new Location(results[i], i));
		}

	});


	//locations = self.myPubs();
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

	// Activates marker... basically it opens marker's infowindow when
	// click the list item
	self.activateMarker = function (item) {
		self.isClickedToggle(item, self.myPubs());
		self.liSelected(item.title);

		if (item.isClicked) {

			// This is a trigger. It activates smth inside google maps init function 
			// by being used outside of it... awesome feature
			google.maps.event.trigger(item.marker, 'click');
		}
	}
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