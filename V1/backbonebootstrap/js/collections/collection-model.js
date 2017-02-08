/*global Backbone */

(function () {
	'use strict';

    var R = window.Rdbhost;

    // Our basic Thread model.
    app.DVDList = Backbone.Collection.extend({

        model: app.DVD,

        initialize: function(models, options) {

        },

        sync: function(method, model, options) {

            options = options || {};

            switch(method) {

                case 'read':
                    var p = R.preauthPostData({

                        q: 'SELECT id, name, rating FROM sandbox.dvds_jsbackbone;'
                    });
                    p.then(function(resp) {
                        var rows = resp.row_count[0] > 0 ? resp.records.rows : [];
                        options.success(rows);
                    });
                    p.fail(function(err) {
                        options.error(err);
                    });
                    break;

                default:

                    throw new Error('bad method in Collection.sync ' + method);
            }
        }
    });

})();
