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


