/*global Backbone */

(function () {
	'use strict';

    var R = window.Rdbhost;

    var addDVDSQL = 'INSERT INTO sandbox.dvds_jsbackbone   ' +
        '   (name, rating) VALUES (%(name), %(rating)); \n' +
        "SELECT currval('sandbox.dvds_jsbackbone_id_seq');",

        deleteDVDSQL = 'DELETE FROM sandbox.dvds_jsbackbone WHERE id = %(id);';


    // Our basic Message model.
    app.DVD = Backbone.Model.extend({

        // Default attributes for a thread
        defaults: {
            name: '',
            rating: ''
        },

        sync: function(method, model, options) {

            options = options || {};

            switch(method) {

                case 'create':

                    var p = R.preauthPostData({
                        authcode: '-',
                        q: addDVDSQL,
                        namedParams: model.attributes
                    });
                    p.then(function(resp) {
                        console.log('successful save ' + resp.status);
                        // pass message_id to success callback
                        var tmp = {'id': resp.result_sets[1].records.rows[0].currval};
                        options.success(tmp);
                    });
                    p.fail(function(err) {
                        console.log('failing save ' + err[0] + ' ' + err[1]);
                        if ( options && options.error )
                            options.error(err);
                    });
                    break;

                default:

                    throw new Error('bad method in DVD.sync ' + method);
                    break;

            }
        },

        destroy: function(options) {

            var this_ = this,
                p = R.preauthPostData({

                    q: deleteDVDSQL,

                    namedParams: this_.attributes
                });

            p.then(function(resp) {
                if ( options && options.success )
                    options.success(resp);
            });

            p.fail(function(err) {
                if ( options && options.error )
                    options.error(err);
                console.log('ERROR ~1 ~2'.replace('~1', err[0]).replace('~2', err[1]));
            });
        }

    });

})();
