/*global Backbone $ */

(function () {
	'use strict';

    var R = window.Rdbhost;

    // Router
    // ----------
    var RdbhostRouter = Backbone.Router.extend({

        routes: {
            '!/dvd-configure': 'showDVDConfigure',
            '!/dvd-preauth':   'showDVDList',
            '!/eml-configure': 'showEmailConfigure',
            '!/eml-preauth':   'showEmailPreauth',
            '!/oid-preauth':   'showOpenId',
            '!':               'goDVDList',
            '':                'goDVDList'
        },

        showDVDConfigure: function () {

            var dvd = new app.DVD();
            var dV = new app.DVDConfigureView({model: dvd});
            dV.render();
        },

        showDVDList: function () {

            var dvdLV = new app.DVDListView();
            dvdLV.render();
        },

        showEmailConfigure: function () {

            var eV = new app.EmailConfigureView();
            eV.render();
        },

        showEmailPreauth: function () {

            var eV = new app.EmailingView();
            eV.render();
        },

        showOpenId: function () {

            var eV = new app.OpenIDView();
            eV.render();
        },

        goDVDList: function () {

            app.router.navigate('#!/dvd-preauth', {trigger: true});
        }

    });


    // create router instance
    app.router = new RdbhostRouter();

    Backbone.history.start();


})();
