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
}

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
		} else {
			alert('There\'s something wrong with Google Places API.\nEnded up with error status ' + status + '\nPlease try to reload the page. It might fix it... Or google up the status to find out what it means.');
		}
	});

	markerStadium.addListener('click', function () {
		infowindow.open(map, markerStadium);
	});

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
			id: i,
			icon: 'img/beer.png'
		});

		// Create an onclick event to open an infowindow at each marker.
		appViewModel.myPubs()[i].marker.addListener('click', function () {
			populateInfoWindow(this, largeInfowindow);

			appViewModel.myPubs().forEach(function (item) {
				item.marker.setAnimation(null);
			});
			this.setAnimation(google.maps.Animation.BOUNCE);
		});

		bounds.extend(appViewModel.myPubs()[i].position);
	}

	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);

	google.maps.event.addDomListener(window, 'resize', function () {
		map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
	});
	// It's a good idea to start KO inside of succesful google maps api call
	ko.applyBindings(appViewModel);
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
	if (infowindow.marker !== marker) {
		infowindow.marker = marker;
		var id = marker.id;
		var location = getLocation(appViewModel.myPubs(), id);
		infowindow.setContent('<span class="info-heading">Title:</span> ' + marker.title + '<br><br>' +
			'<span class="info-heading">Venue ID:</span> ' + location.venueId + '<br><br>' +
			'<span class="info-heading">Phone:</span> <a href="tel:' + location.phone + '">' + location.formattedPhone + '</a>' + '<br><br>' +
			'<span class="info-heading">Address:</span> ' + '<br>' +
			location.address.street + '<br>' +
			location.address.city + '<br>' +
			location.address.country + '<br><br>' +
			'<span class="info-heading">Distance to Anfield:</span> ' + location.distance + 'm<br><br>' +
			'<span class="info-heading">Verified Foursquare account:</span> ' + location.verified + '<br><br>' +
			'<a href="' + location.foursquareProfileURL + '" target="_blank">Foursquare profile link</a><br><br>');

		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function () {
			infowindow.setMarker = null;
			marker.setAnimation(null);
		});
	}

	infowindow.open(map, marker);
}

//Knockout's viewmodel
function AppViewModel() {
	var self = this;

	self.myPubs = ko.observableArray([]);

	//Working around foursquare api
	var client_id = 'ZRZOYO5I4TD5PDUZZOOQ4UNAVORKVMQJJDM5S4YUBNFHD05C';
	var client_secret = 'LDAYVFPBDALCUPTK1DBDSZC4XF5AHGG1I5IWOTSNI4YW1WXT';
	var placeId = '4baf7f4ff964a520bd043ce3';
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + client_id + '&client_secret=' + client_secret + '&v=20130815&ll=53.430849,-2.960862&&radius=3000&categoryId=4bf58dd8d48988d155941735,52e81612bcbc57f1066b7a06,4bf58dd8d48988d11b941735';

	function loadJSON(callback) {
		fetch(foursquareURL)
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				callback(json.response.venues);
			})
			.catch(function (error) {
				alert('Oops.. the error has occured while loading data from Fousquare.\n\nError message:\n ' + error);
			});
	}

	loadJSON(function (venues) {
		venues.forEach(function (venue, i) {
			self.myPubs.push(new Location(venue, i));
		});

		self.inputField = ko.observable('');

		// This observable is a need. When you put the cursor into the input field
		// it makes list of titles visible and hides them when cursor is off.
		self.isSelected = ko.observable(false);

		// Now let's try to implement filtering
		self.filteredItems = ko.computed(function () {
			if (self.inputField().length > 0) {
				return ko.utils.arrayFilter(self.myPubs(), function (item) {
					var chosenItem = item.title.toLowerCase().indexOf(self.inputField().toLowerCase()) > -1;
					if (!chosenItem) {
						item.marker.setVisible(false);
					} else {
						item.marker.setVisible(true);
					}

					return chosenItem;
				});
			} else {
				for (var i = 0; i < self.myPubs().length; i++) {
					if (self.myPubs()[i].marker) {
						self.myPubs()[i].marker.setVisible(true);
					}
				}

				return self.myPubs();
			}
		});

		self.liSelected = ko.observable();

		// Activates marker... basically it opens marker's infowindow when
		// click the list item
		self.activateMarker = function (item) {
			google.maps.event.trigger(item.marker, 'click');

			self.liSelected(item.title);
		};
		
		initMap();
	});
}
var appViewModel = new AppViewModel();

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

// Google maps loading error handler
function mapsInitError() {
	var mapElement = document.getElementById('map');
	mapElement.setAttribute("data-bind", "text: errMsg")
	mapElement.style.margin = 'auto';
	mapElement.style.fontWeight = 700;
	mapElement.style.fontSize = '48px';
	mapElement.style.textAlign = 'center';
	mapElement.innerHTML = 'Oh, no ☹<br> Seems like Google Maps couldn\'t load<br>Try to reload a page, maybe it will help.';
}