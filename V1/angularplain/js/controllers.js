'use strict';


// tell rdbhost module what role and account we are using
//
$.rdbHostConfig({
    accountNumber : 14,
    domain        : "www.rdbhost.com",
    userName      : 'super'
});


var mod = angular.module('myApp.controllers', ['ngResource']);

// Produce a new rdbHttp object for interacting with Rdbhost
mod.factory('$rdbHttp', ['$http', '$q', Rdbhost.Angular.makeRdbHttp]);

// Configure $httpProvider to remove unwanted headers, and add response transform
mod.config(['$httpProvider', Rdbhost.Angular.providerInit]);


/* Controllers */

mod.controller('DvdConfigureController', ['$scope', '$rdbHttp', function($scope, $http) {

    var R = window.Rdbhost;

    $scope.status = [];

    function add_status_line(ln) {

        $scope.status.push(ln);
    }

    var TABLE_ALREADY_EXISTS = '42P07',
        SCHEMA_ALREADY_EXISTS = '42P06';

    var createSchemaSQL = 'CREATE SCHEMA sandbox;   ';

    var grantPrivs =
        'GRANT USAGE ON SCHEMA sandbox TO p0000000014;'+
        'GRANT INSERT, SELECT, UPDATE                 '+
        '  ON sandbox.dvds_jsintro TO p0000000014;    ';

    var createTableSQL =
        'CREATE TABLE sandbox.dvds_jsintro(           '+
        '  id          SERIAL PRIMARY KEY,            '+
        '  name        varchar(40) NOT NULL,          '+
        '  rating      float,                         '+
        '  UNIQUE(name)                               '+
        ');                                           ';

    var addDVDSQL =
        'INSERT INTO sandbox.dvds_jsintro               '+
        '   (name, rating) VALUES (%(name), %(rating))  ';

    var getDVDListSQL = 'SELECT name, rating FROM sandbox.dvds_jsintro';

    function createDVDTable() {

        var opts = {
            q: createTableSQL,
            authcode: ''
        };

        R.provideSuperPOST(opts, function(gP) {

            var p = $http.post( gP.url, gP.data );

            p.success(function (data, status, headers, config) {

                add_status_line('table created');
                grantPrivsPreauth();
            });

            p.error(function (data, status, headers, config) {

                var err = data.error;
                if ( err[0] === TABLE_ALREADY_EXISTS ) {

                    add_status_line('table dvds_jsintro already exists');
                    grantPrivsPreauth();
                }
                else {
                    add_status_line(err[1]);
                }
            });
        });
    }

    function grantPrivsPreauth() {

        var opts = {
            q: grantPrivs,
            authcode: ''
        };

        R.provideSuperPOST(opts, function(gP) {

            var p = $http.post( gP.url, gP.data );

            p.success(function (data, status, headers, config) {

                add_status_line('privs granted to preauth role');
            });

            p.error(function (data, status, headers, config) {

                var err = data.error;
                add_status_line(err[1]);
            });
        });
    }

    $scope.createResources = function() {

        var opts = {
            q: createSchemaSQL
        };

        R.provideSuperPOST(opts, function(gP) {

            var p = $http.post( gP.url, gP.data );

            p.success(function(data, status, headers, config) {

                add_status_line('schema was created');
                createDVDTable();
            });

            p.error(function(data, status, headers, config) {

                var err = data.error;

                if ( err[0] === SCHEMA_ALREADY_EXISTS ) {

                    add_status_line('schema already exists');
                    createDVDTable();
                }
                else
                    add_status_line(err[1]);
            })
        })
    }
}]);


mod.controller('DvdPreauthController', ['$scope', '$rdbHttp', '$resource', function($scope, $http, $resource) {

    var R = window.Rdbhost,
        RA = R.Angular;

    $scope.status = [];
    $scope.dvds = [];

    function add_status_line(ln) {

        $scope.status.push(ln);
    }

    var addDVDSQL = 'INSERT INTO sandbox.dvds_jsintro  (name, rating) VALUES (%(name), %(rating))      ';

    var getDVDListSQL = 'SELECT name, rating FROM sandbox.dvds_jsintro';

    var role = 'p'+('000000000'+ $.rdbHostConfig.opts.accountNumber).substr(-10);


    var listResource = $resource('https://:domain/db/:userName',

        { // default params

            userName: role,
            domain: $.rdbHostConfig.opts.domain
        },

        { // actions

            query: {

                method: 'GET',
                params: {
                    q: getDVDListSQL,
                    format: 'json-easy'
                },
                isArray: true,

                transformRequest: RA.rdbhostTransformRequest,

                transformResponse: RA.rdbhostTransformResponseFactory(true)
            },

            save: {

                method: 'POST',
                params: {
                    q: addDVDSQL,
                    format: 'json-easy'
                },

                transformRequest: RA.rdbhostTransformRequest,

                transformResponse: RA.rdbhostTransformResponseFactory(false)
            }
        }
    );

    // updater for list
    //
    $scope.listDVDs = function () {

        $scope.dvds = listResource.query({},
            function() {
                add_status_line('DVDs listed');
            },
            function() {
                add_status_line('DVD List Error');
            }
        );

        return false;
    };

    // submit handler for form
    //
    $scope.addDVD = function () {

        var namedParams = {

            name: $scope.newTitle,
            rating: $scope.newRating
        };

        listResource.save(namedParams,
            function() {
                add_status_line('DVD was added.');
            },
            function(err) {
                add_status_line(err.message);
            }
        );

        return false;
    };

}]);


mod.controller('EmailConfigureController', ['$scope', function($scope) {

    var R = window.Rdbhost;

    $scope.status = [];

    function add_status_line(ln) {

        $scope.status.push(ln);
    }

    $scope.addEmailService = function () {

        var p = R.setupEmail({

            service: $scope.emlservice,
            apikey: $scope.emlapikey,
            acctemail: $scope.emlacctemail,
            webmaster: $scope.emlwebmaster
        });

        p.done(function(resp) {

            // calling $apply keeps angular bindings in sync
            $scope.$apply( add_status_line('email apikey added to apis table') );
        });
        p.fail(function(errArray) {

            // calling $apply keeps angular bindings in sync
            $scope.$apply( add_status_line('email apikey addition failed! ' + errArray[1]) );
        });

        return false;
    }
}]);


mod.controller('EmailPreauthController', ['$scope', function($scope) {

    var R = window.Rdbhost;

    $scope.status = [];

    function add_status_line(ln) {

        $scope.status.push(ln);
    }

    /*
     callback function for mail sending
     */
    function followUpEmailing(resp) {

        var httpStat = resp.status[0];

        if (httpStat === 'error') {

            add_status_line('Email was not Sent %s'.replace('%s', resp.error[1]));
        }
        else {

            var stat = resp.records.rows ? resp.records.rows[0].result : 'no emails sent';
            if (stat === 'Success') {

                add_status_line('Email was sent successfully');
            }
            else {

                add_status_line('Error: %s'.replace('%s',stat));
            }
        }
    }

    /*
     * attach click handler to form button, to send email when form submitted.
     *
     * The body is the only user entered part of the email, and is passed as the one param
     */
    $scope.sendEmail = function () {

        var p = R.emailWebmaster({

            bodyString: $scope.emailBody,
            // replyTo: jsdemos@travelbyroad.net',
            subject: 'test subject'
        });

        p.done(function (resp) {

            $scope.$apply( function() { followUpEmailing(resp) } );
        });

        p.fail(function(errArry) {

            $scope.$apply( function() { add_status_line(errArry[1]) } );  // database error message
        });

        return false;
    }

}]);


mod.controller('OpenIDPreauthController', ['$scope', '$timeout', function($scope, $timeout) {

    var R = window.Rdbhost;

    $scope.status = [];
    $scope.ident = '';

    $.rdbHostConfig({
        accountNumber: 14,
        userName: "read",
        domain: "www.rdbhost.com"
    });

    function add_status_line(ln) {

        $scope.status.push(ln);
    }

    $timeout(function () {

        R.loginOpenId({

            loginForm: 'openidForm',
            callback: function(key, ident) {

                add_status_line('logged in as ' + ident);
                $scope.ident = ident;
            }
        });
    },100)

}]);