var infoApp1 = angular.module('infoApp1', ["ngRoute", 'angularMoment', 'ngResource', 'ngMaterial', 'ngCookies','ngAnimate']);

infoApp1.config(function ($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');
	$routeProvider
		//.when("/",{templateUrl:"index.php"})
		//.when("/", { redirectTo: '/'+$cookies.get('LastVisitURL') })
		.when("/", { title: 'Last Vistited' ,templateUrl: 'templates/login.html', controller: "loginController" })
		.when("/homescreen", { title: 'Home Screen Launcher' ,templateUrl: 'templates/login.html', controller: "loginController" })
		.when("/station/:stationName", { title: 'Station Board' ,templateUrl: 'templates/station.html', controller: "stationCtrl" })
		.when("/connection/:fromStation/:toStation/:connectionName", { title: 'Connection Borad' ,templateUrl: "templates/connection.html", controller: "connectionCtrl" })
		.when("/weather/:cityName", { title: 'Weather Forecast' ,templateUrl: 'templates/weather.html', controller: "weatherCtrl" })
		.when("/weatherstation/:stationCode", { title: 'Weather Station' ,templateUrl: 'templates/weatherstation.html', controller: "weatherstationCtrl" })
		.when("/AddStation", { title: 'Add a Station Borad' ,templateUrl: 'templates/AddStation.html', controller: "transportCtrl" })
		.when("/AddConnection", { title: 'Add a Connection' ,templateUrl: 'templates/AddConnection.html', controller: "transportCtrl" })
		.when("/AddCityWeather", { title: 'Add City Forecast' ,templateUrl: 'templates/AddCityWeather.html', controller: "transportCtrl" })
		.when("/AddWeatherStation", { title: 'Add a Weather Station' ,templateUrl: 'templates/AddWeatherStation.html', controller: "transportCtrl" })
		.when("/About", { title: 'About' ,templateUrl: 'templates/About.html', controller: "transportCtrl" })
		.when("/HowToUse", { title: 'How to Use' ,templateUrl: 'templates/HowToUse.html', controller: "transportCtrl" })
		
		//.otherwise("/");
		.otherwise({ redirectTo: '/' });
});
///////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////

infoApp1.controller('loginController', function ($scope, $location ,$cookies ,boardsArraySource ) {
	console.log('loginController ,LastVisitURL ==>'+boardsArraySource.LastVisitURL);
	$location.path( ''+boardsArraySource.LastVisitURL );
});
///////////////////////////////////////////////////////////////
infoApp1.filter('isFutureConnection', function () {
	return function (x) {
		return (moment().unix() <= x.from.departureTimestamp);
	}
});
///////////////////////////////////////////////////////////////
infoApp1.filter('isFutureStationDeparture', function () {
	return function (x) {
		return (moment().unix() <= x.stop.departureTimestamp);
	}
});
///////////////////////////////////////////////////////////////
infoApp1.service('boardsArraySource', ['$location', '$cookies', function ($location, $cookies) {
	this.MyBoards = $cookies.getObject('MyBoards');
	this.OWAPIKEY = $cookies.get('OWAPIKEY');
	this.LastVisitURL = $cookies.get('LastVisitURL');
	//if (typeof this.MyBoards=="undefined") this.MyBoards=new Array();
	if (typeof this.OWAPIKEY == "undefined") this.OWAPIKEY = '';
	if (typeof this.MyBoards == "undefined") this.MyBoards = [
		{ "type": "station", "stationName": "Bern, Bahnhof" },
		{ "type": "station", "stationName": "Zürich HB" },
		{ "type": "connection", "from": "Bern, Ka-We-De", "to": "Zürich Hardbrücke", "connectionName": "A2B" },
		{ "type": "weatherstation", "code": "LUG", "name": "Lugano" }
	];
	if (typeof this.LastVisitURL == "undefined") this.LastVisitURL = 'station/Bern, Bahnhof' ;

	var expiresdt = new Date();
	expiresdt.setDate(expiresdt.getDate() + 10000);

	this.addItem = function (item) {
		console.log("addItem ==>" + item.type);
		this.MyBoards.push(item);
		console.log("addItem ,MyBoards after ==>" + JSON.stringify(this.MyBoards));
		$cookies.putObject('MyBoards', this.MyBoards, {
			expires: expiresdt
		});
	};

	this.setLastVisitURL= function (item) {
		console.log("setLastVisitURL ==>" + item );
		$cookies.put('LastVisitURL', item, {
			expires: expiresdt
		});
		this.LastVisitURL = $cookies.get('LastVisitURL');
	};

	this.removeItem = function (index) {
		this.MyBoards.splice(index, 1);
		$cookies.putObject('MyBoards', this.MyBoards, {
			expires: expiresdt
		});
	};

	this.setOWAPIKEY = function (OWAPIKEY) {
		$cookies.put('OWAPIKEY', OWAPIKEY, {
			expires: expiresdt
		});
		this.OWAPIKEY = $cookies.get('OWAPIKEY');
	}
}]);
///////////////////////////////////////////////////////////////////////////////////
infoApp1.service('transportOpendataChAPI', function ($http, $q, $window) {
	this.fetchTransportAPIStation = function ($http, $scope, URL, StationName) {
		console.log("Started");
		console.log("URL:" + URL);
		console.log("StationName:" + StationName);
		$http.get(URL, { header: { 'Content-Type': 'application/json; charset=iso-8859-1' } })
			.success(function (response) {
				$scope.FromStationName = response;
				console.log("fetchTransportAPIStation Response:" + JSON.stringify(response));
			})
			.error(function (data, status) {
				console.error('Error occurred:', data, status);
				setTimeout(fetchTransportAPIStation2($http, $scope, URL, StationName), 1000);
			}).finally(function () {
				console.log("fetchTransportAPI " + StationName + " Finished.");
			});
	};
	this.fetchTransportAPIConnection = function ($http, $scope, URL, fromStation, toStation, connectionName) {
		console.log("Started");
		console.log("URL:" + URL);
		console.log("fromStation:" + fromStation);
		console.log("toStation:" + toStation);
		console.log("connectionName:" + connectionName);
		$http.get(URL)
			.success(function (response) {
				$scope.fromToConnections = response;
				$scope.date = moment().format('MM/DD/YYYY HH:mm:SS');
				console.log("Response:" + response);
			})
			.error(function (data, status) {
				console.error('Error occurred:', data, status);
				setTimeout(fetchTransportAPIConnection($http, $scope, URL, StationName), 1000);
			}).finally(function () {
				console.log("fetchTransportAPI " + StationName + " Finished.");
			});
	};
	this.getStations = function (stationName) {
		console.log("Looking up station:" + stationName);
		//var deferred = $q.defer();
		return $http
			.get('https://transport.opendata.ch/v1/locations?type=station&query=' + stationName)
			.then(function (response) {
				console.log(JSON.stringify(response));
				if (typeof response.data.stations === 'object') {
					console.log("valid response");
					return response.data.stations;
				} else {
					// invalid response
					console.log("invalid response");
					return $q.reject(response);
				}
			}, function (response) {
				// something went wrong
				return $q.reject(response);
			});
	}
	this.getStations2 = function (stationName) {
		console.log("Looking up station:" + stationName);
		var deferred = $q.defer();
		$http
			.get('https://transport.opendata.ch/v1/locations?type=station&query=' + stationName)
			.success(function (response) {
				console.log("getStations , response==> " + JSON.stringify(response));
				//$scope.stationsQResult=response;
				//var suggestions = response.stations;
				//console.log(JSON.stringify(suggestions));
				deferred.resolve(response.stations);
				return deferred.promise;
			})
			.error(function () {
				deferred.reject();
				return deferred.promise;
			});
	}
});
////////////////////////////////////////////////////////////////////////////////////
infoApp1.service('weatherStationSearchFactory', function ($http, $q) {
	this.getweatherStations = function ($scope) {
		console.log("Loading all station");
		$http
			.get("https://opendata.netcetera.com/smn/smn/")
			.success(function (response) {
				console.log("getweatherStations , response==> " + JSON.stringify(response));
				$scope.weatherStations = response;
				console.log("getweatherStations , stations==> " + JSON.stringify($scope.weatherStations));
				return response;
			})
			.error(function (response) {
				console.error('Error while fetching stations');
				return $q.reject(errResponse);
			});
	};
});
////////////////////////////////////////////////////////////////////////////////////////
infoApp1.controller('stationCtrl', function ($scope, $http, $route, $location,
	$filter, $routeParams, moment, $interval, transportOpendataChAPI,boardsArraySource) {
	$scope.msg = "stationCtrl";
	console.log("stationCtrl");
	console.log("routeParams:" + $routeParams.stationName);
	$scope.stationName = $routeParams.stationName;
	$scope.stationDescription = $routeParams.stationName;
	console.log("$scope.stationName:" + $scope.stationName);
	console.log("$scope.stationDescription:" + $scope.stationDescription);
	var url = 'https://transport.opendata.ch/v1/stationboard?station=' + $scope.stationDescription + '&limit=20&fields[]=stationboard/stop/departureTimestamp&fields[]=stationboard/stop/departure&fields[]=stationboard/stop/delay&fields[]=stationboard/name&fields[]=stationboard/category&fields[]=stationboard/number&fields[]=stationboard/operator&fields[]=stationboard/to';
	transportOpendataChAPI.fetchTransportAPIStation(
		$http,
		$scope,
		url,
		$scope.stationName
	);
	console.log ($scope.msg+' , $location.path()==>'+$location.path());
	boardsArraySource.setLastVisitURL( ''+$location.path() );

	$scope.reload = function () {
		transportOpendataChAPI.fetchTransportAPIStation(
			$http,
			$scope,
			url,
			$scope.stationName
		);
		console.log("stationCtrl-reloaded."+moment().format("YYYY MM DD HH:mm:ss"));
	};
	$interval($scope.reload, 60000 * 2);
});
////////////////////////////////////////////////////////////////////////////////////////
infoApp1.controller('connectionCtrl', function ($scope, $location, $http, $routeParams, moment, 
	$interval, transportOpendataChAPI,boardsArraySource) {
	$scope.msg = "connectionCtrl";
	$scope.message = {
		text: 'hello world!',
		time: new Date()
	};
	console.log("connectionCtrl");
	$scope.fromStation = $routeParams.fromStation;
	$scope.toStation = $routeParams.toStation;
	$scope.connectionName = $routeParams.connectionName;
	var url = 'https://transport.opendata.ch/v1/connections?from=' + $scope.fromStation + '&to=' + $scope.toStation + '&fields[]=connections/from/departureTimestamp&fields[]=connections/from/departure&fields[]=connections/from/station/name&fields[]=connections/duration&fields[]=connections/to/arrivalTimestamp&fields[]=connections/to/arrival&fields[]=connections/sections/journey/name&fields[]=connections/sections/journey/category&fields[]=connections/sections/journey/operator&fields[]=connections/sections/journey/number&fields[]=connections/sections/departure/station/name&fields[]=connections/sections/departure/departure&fields[]=connections/sections/departure/departureTimestamp&fields[]=connections/sections/arrival/station/name&fields[]=connections/sections/arrival/arrival&fields[]=connections/sections/arrival/arrivalTimestamp';
	transportOpendataChAPI.fetchTransportAPIConnection(
		$http,
		$scope,
		url,
		$scope.fromStation,
		$scope.toStation,
		$scope.connectionName
	);
	$scope.reverseConnection = function () {
		url = 'https://transport.opendata.ch/v1/connections?from=' + $scope.toStation + '&to=' + $scope.fromStation + '&fields[]=connections/from/departureTimestamp&fields[]=connections/from/departure&fields[]=connections/from/station/name&fields[]=connections/duration&fields[]=connections/to/arrivalTimestamp&fields[]=connections/to/arrival&fields[]=connections/sections/journey/name&fields[]=connections/sections/journey/category&fields[]=connections/sections/journey/operator&fields[]=connections/sections/journey/number&fields[]=connections/sections/departure/station/name&fields[]=connections/sections/departure/departure&fields[]=connections/sections/departure/departureTimestamp&fields[]=connections/sections/arrival/station/name&fields[]=connections/sections/arrival/arrival&fields[]=connections/sections/arrival/arrivalTimestamp';
		var from = $scope.fromStation;
		var to = $scope.toStation;
		console.log("From:" + from + ",TO:" + to);
		console.log("URL:" + url);
		$scope.fromStation = to;
		$scope.toStation = from;
		$scope.reload();
	};
	/////////////////////////////////////////
	console.log ($scope.msg+' , $location.path()==>'+$location.path());
	boardsArraySource.setLastVisitURL($location.path() );
	$scope.reload = function () {
		transportOpendataChAPI.fetchTransportAPIConnection(
			$http,
			$scope,
			url,
			$scope.fromStation,
			$scope.toStation,
			$scope.connectionName
		);
		console.log("connectionCtrl-reloaded."+moment().format("YYYY MM DD HH:mm:ss"));
	};
	$interval($scope.reload, 60000 * 2);
});

////////////////////////////////////////////////////////////////////////////////////////
infoApp1.controller('transportCtrl', function ($scope, $http, $location, moment, $interval, transportOpendataChAPI,
												 boardsArraySource, weatherStationSearchFactory) {
	var self = this;
	$scope.msg = "transportCtrl";
	$scope.selectedItem = '';
	$scope.searchText = '';
	$scope.isDisabled = false;
	$scope.selectedStation = "";
	$scope.MyBoards = boardsArraySource.MyBoards;
	$scope.OWAPIKEY = boardsArraySource.OWAPIKEY;

	$scope.transportOpendataChAPI = transportOpendataChAPI;
	$scope.selectedItemChange = function (item) {
		console.log('selectedItemChange ' + JSON.stringify(item));
	};
	$interval($scope.updateTime, 1000);
	$scope.addStation = function (selectedStation) {	
	if (typeof selectedStation != 'undefined') {
		console.log("addStation ==>" + JSON.stringify(selectedStation));
		var newObj = {};
		newObj['type'] = 'station';
		newObj['stationID'] = selectedStation.id;
		newObj['stationName'] = selectedStation.name;
		boardsArraySource.addItem(newObj);
	}
	};
	$scope.addConnection = function () {
		// add validation and Error message feed back mechanism
		console.log("selectedItemFrom:" + JSON.stringify($scope.selectedItemFrom));
		console.log("selectedItemTo:" + JSON.stringify($scope.selectedItemTo));
		console.log("connectionName:" + $scope.connectionName);
		var newObj = {};
		newObj['type'] = 'connection';
		newObj['from'] = $scope.selectedItemFrom.name;
		newObj['to'] = $scope.selectedItemTo.name;
		newObj['connectionName'] = $scope.connectionName;
		boardsArraySource.addItem(newObj);
	};
	$scope.addWeather = function () {
		//{type:'weather',cityName:'Cairo,EG'},
		console.log("cityName:" + $scope.cityName);
		console.log("OWAPIKEY:" + $scope.OWAPIKEY);
		var newObj = {};
		newObj['type'] = 'weather';
		newObj['cityName'] = $scope.cityName;
		boardsArraySource.addItem(newObj);
		boardsArraySource.setOWAPIKEY($scope.OWAPIKEY);
	};
	$scope.removeItem = function (index) {
		boardsArraySource.removeItem(index);
	};
	$scope.moment = moment;
	$scope.updateTime = function updateTime() {
		$scope.currDateTime = moment();
		console.log("interval " + $scope.msg);
		//$route.reload();
	};
	//smn part
	$scope.matches = new Array();
	$scope.selectedWeatherStation = '';
	$scope.searchTextWeatherStation = '';
	$scope.weatherStations = new Array();
	$scope.queryWeatherSearch = function () {
		console.info('queryWeatherSearch :' + $scope.searchTextWeatherStation);
		if ($scope.weatherStations.length == 0) {
			weatherStationSearchFactory.getweatherStations($scope);
			console.log("queryWeatherSearch , stations==> " + JSON.stringify($scope.weatherStations));
			console.log("queryWeatherSearch , matches==> " + JSON.stringify($scope.matches));
		}
		var result = new Array();
		for (var i = 0; i < $scope.weatherStations.length; i++) {
			var mName = $scope.weatherStations[i].station.name.toLowerCase();
			var mMatch = mName.search($scope.searchTextWeatherStation.toLowerCase());
			if (mMatch > -1) {
				console.info('queryWeatherSearch match found :' + $scope.searchTextWeatherStation + " , " + $scope.weatherStations[i].station.name);
				result.push($scope.weatherStations[i]);
			} else {
				//console.info('queryWeatherSearch match NOT found :' +$scope.searchTextWeatherStation+" , "+ $scope.weatherStations[i].station.name);
			}
		}
		$scope.matches = result;
	};
	//
	$scope.searchTextWeatherStationChange = function (text) {
		console.info('searchTextWeatherStationChange ' + text);
		$scope.queryWeatherSearch($scope);
	};
	$scope.selectedWeatherStationChange = function (item) {
		console.info('selectedWeatherStationChange (ITEM):' + JSON.stringify(item));
		var newObj = {};
		newObj['type'] = 'weatherstation';
		newObj['code'] = item.station.code;
		newObj['name'] = item.station.name;
		boardsArraySource.addItem(newObj);
	};
	$scope.stopTime = $interval($scope.updateTime, 1000);
	$scope.$on('$destroy', function () {
		// Make sure that the interval is destroyed too
		$interval.cancel($scope.stopTime);
	});
});
////////////////////////////////////////////////////////////////////////////////////////
infoApp1.controller('weatherCtrl', function ($scope, $http, $location,$routeParams, moment,
	 boardsArraySource, moment, $interval) {
	$scope.msg = "weatherCtrl";
	$scope.cityName = $routeParams.cityName;
	var url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + $routeParams.cityName + '&units=metric&mode=json&appid=' + boardsArraySource.OWAPIKEY;
	$http.get(url)
		.success(function (response) {
			//to add the day marker
			console.log("response.list.length:" + response.list.length);
			var prevDay = moment.unix(response.list[0].dt).format('YYYY MM DD');
			for (var i = 0; i < response.list.length; i++) {
				var currDay = moment.unix(response.list[i].dt).format('YYYY MM DD');
				if (prevDay == currDay) {
					response.list[i].seperatorStyle = "";
				} else {
					response.list[i].seperatorStyle = "success";
				}
				prevDay = currDay;
			}
			$scope.weatherResponse = response;
			console.log(response);
		});
	$scope.convert = function (degree, dval) {
		if (degree == "C") {
			F = dval * 9 / 5 + 32;
			return (Math.round(F));
		} else {
			C = ((dval - 32) * 5 / 9);
			return (Math.round(C));
		}
	};
	console.log ($scope.msg+' , $location.path()==>'+$location.path());
	boardsArraySource.setLastVisitURL($location.path() );
});
////////////////////////////////////////////////////////////////////////////////////////
infoApp1.controller('weatherstationCtrl', function ($scope, $http,  $location,$route, $filter,boardsArraySource,
	 $routeParams, moment, $interval, transportOpendataChAPI) {
	$scope.msg = "weatherstationCtrl";
	console.log("weatherstationCtrl");
	console.log("routeParams:" + $routeParams.stationCode);
	$scope.weatherstationCode = $routeParams.stationCode;
	console.log("$scope.stationCode:" + $scope.weatherstationCode);

	var url = 'https://opendata.netcetera.com/smn/smn/' + $scope.weatherstationCode;
	//var url = 'http://opendata.netcetera.com/smn/smn/' + $scope.weatherstationCode;
	//var url='http://data.netcetera.com/smn/smn';
	$http.get(url)
		.success(function (response) {
			console.log("response==>" + response);
			$scope.weatherStationResponse = response;
		});
	/////////////////////////////////////////////////////////
	console.log ($scope.msg+' , $location.path()==>'+$location.path());
	boardsArraySource.setLastVisitURL($location.path() );
	/////////////////////////////////////////////////////////
	$scope.reload = function () {
		$http.get(url)
			.success(function (response) {
				console.log("response==>" + JSON.stringify(response) );
				$scope.weatherStationResponse = response;
			});
		console.log("weatherstationCtrl-reloaded: "+moment().format("YYYY MM DD HH:mm:ss"))
	};
	$interval($scope.reload, 60000 * 9);
});
////////////////////////////////////////////////////////////////////////////////////////
