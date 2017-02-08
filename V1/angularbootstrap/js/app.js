'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngRoute', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers']).
  config(['$routeProvider', function($routeProvider) {

    $routeProvider.when('/dvd-configure', {templateUrl: 'partials/dvd-configure.html', controller: 'DvdConfigureController'});
    $routeProvider.when('/dvd-preauth', {templateUrl: 'partials/dvd-preauth.html', controller: 'DvdPreauthController'});

    $routeProvider.when('/eml-configure', {templateUrl: 'partials/eml-configure.html', controller: 'EmailConfigureController'});
    $routeProvider.when('/eml-preauth', {templateUrl: 'partials/eml-preauth.html', controller: 'EmailPreauthController'});

    $routeProvider.when('/oid-preauth', {templateUrl: 'partials/oid-preauth.html', controller: 'OpenIDPreauthController'});

    $routeProvider.otherwise({redirectTo: '/dvd-preauth'});
  }]);
