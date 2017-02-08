/*global $ */
/*jshint unused:false $ */


// dummy a console, for ie
if ( ! window.console )
    window.console = { 'log': function() {} };

// redirect to https, if not there already
if ( ! ~window.location.host.indexOf('localhost') && window.location.protocol.substr(0,5) !== 'https' )
    window.location.protocol = 'https';

// create app object, for use in other modules
var app = _.extend({ userId: undefined, userKey: undefined }, Backbone.Events);



(function () {

    'use strict';

    var R = window.Rdbhost;

    R.rdbHostConfig({
        domain: 'www.rdbhost.com',
        accountNumber: 14,
        userName: 'preauth'
    });

    function onSuccess(key, ident) {

        app.loginId = ident;
    }

    function onFailure(ident) {

        app.loginId = undefined;
    }

    R.loginOpenId({
        'loginForm': 'openidForm',
        'callback': onSuccess,
        'errback' : onFailure
    });

})();