/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY, Showdown */

(function ($) {
	'use strict';

    var R = window.Rdbhost,

        TABLE_ALREADY_EXISTS = '42P07',
        SCHEMA_ALREADY_EXISTS = '42P06';

    app.StatusRow = Backbone.View.extend({

        tagName: 'li',
        className: 'alert alert-info',

        template: _.template($('#status-row-template').html()),

        render: function() {

            this.$el.html(this.template(this.model.attributes));
            this.$el.show();

            return this;
        }
    });

    var createSchemaSQL = 'CREATE SCHEMA sandbox;   ';

    var grantPrivs = 'GRANT USAGE ON SCHEMA sandbox TO p0000000012;' +
        'GRANT INSERT, SELECT, UPDATE                 ' +
        '  ON sandbox.dvds_jsbackbone TO p0000000012;    ';

    var createTableSQL = 'CREATE TABLE sandbox.dvds_jsbackbone(           ' +
        '  id          SERIAL PRIMARY KEY,            ' +
        '  name        varchar(40) NOT NULL,          ' +
        '  rating      float,                         ' +
        '  UNIQUE(name)                               ' +
        ');                                           ';

    function addStatusLine(str) {

        var statModel = new Backbone.Model({s: str}),
            statRow = new app.StatusRow({model: statModel});
        $('ul.listNone').append(statRow.render().el);
    }

    function createDVDTable() {

        R.superPostData({

            'q': createTableSQL,

            'callback': function () {
                addStatusLine('table created');
                grantPrivsPreauth();
            },

            'errback': function (err) {

                //alert(errmsg);
                if (err[0] === TABLE_ALREADY_EXISTS) {
                    addStatusLine('table dvds_jsbackbone already exists');
                    grantPrivsPreauth();
                }
                else {
                    addStatusLine(err[1]);
                }
            }
        });
    }

    function grantPrivsPreauth() {

        R.superPostData({

            'q': grantPrivs,

            'callback': function () {
                addStatusLine('privs granted to preauth role');
            },

            'errback': function (err) {
                addStatusLine(err[1]);
            }
        });
    }


    app.DVDConfigureView = Backbone.View.extend({

        tagName: 'div',
        className: "formContainer",

        // The DOM events specific to an item.
        events: {
            'click #create-btn':  'createSchema'
        },

        template: _.template($('#dvd-configure-template').html()),

        // Re-render the titles of the thread item.
        render: function () {

            this.$el.html(this.template(this.model));
            this.$el.show();

            $('#page').html(this.el);

            return this;
        },

        createSchema: function() {

            R.superPostData({

                'q': createSchemaSQL,

                'callback': function () {
                    addStatusLine('schema was created');
                    createDVDTable();
                },

                'errback': function (err) {
                    if (err[0] == SCHEMA_ALREADY_EXISTS) {
                        addStatusLine('schema already exists');
                        createDVDTable();
                    }
                    else
                        addStatusLine(err[1]);
                }
            });
        }
    });


    app.DVDRow = Backbone.View.extend({

        tagName: 'tr',
        className: 'alert alert-info',

        template: _.template($('#dvd-display-template').html()),

        render: function() {

            this.$el.html(this.template(this.model.attributes));
            this.$el.show();

            return this;
        }
    });

    // DVD List View
	// --------------

	// The DOM element for a thread item...
	app.DVDListView = Backbone.View.extend({

        tagName: 'div',

        // Our template for the line of statistics at the bottom of the app.
        // statsTemplate: _.template($('#stats-template').html()),

        template: _.template($('#dvd-preauth-template').html()),

		// The DOM events specific to an item.
		events: {
            'click #add-dvd': 'addDVD',
            'click .delete':  'removeDVD'
        },

		// Re-render the dvd page
		render: function () {

            this.$el.html(this.template());
            this.$list = this.$el.find('#dvd-list');

            var dvds = new app.DVDList(),
                that = this;

            dvds.fetch({
                success: function(mdl, resp, opt) {

                    for (var i in resp) {

                        var dvd = resp[i];
                        that.addOneDVDToDisplay(dvd);
                    }
                },
                fail: function(mdl, resp, opt) {

                    alert(resp);
                }
            });

            $('#page').html(this.el);
			return this;
		},

        // submit handler for form
        //
        addDVD: function() {

            var $form = $('#add-form');
            var title = $form.find('#title').val();
            var rating = $form.find('#rating').val();
            var that = this;

            var newDvd = new app.DVD({name: title, rating: rating});

            newDvd.save({}, {
                success: function(mdl, resp, opt) {
                    addStatusLine('DVD added');
                    that.addOneDVDToDisplay(mdl.attributes);
                    $form.find('#title').val('');
                    $form.find('#rating').val('');
                },
                error: function(mdl, error, opt) {
                    addStatusLine('error '+ error[1]);
                }
            });

            return false;
        },

        removeDVD: function(ev) {

            var tgt = $($(ev)[0].target).attr('data-id');

            var tmpDvd = new app.DVD({id: tgt});
            tmpDvd.destroy();

            var $row = $($(ev)[0].target).closest('tr');
            $row.remove();

            return false;
        },

        // Add a single dvd to the list by creating a view for it, and
        // appending its element to the `<tbody>`.
        addOneDVDToDisplay: function (dvd, idx) {

            var dvdMdl = new Backbone.Model(dvd),
                dvdDisp = new app.DVDRow({model: dvdMdl}),
                tmp = dvdDisp.render().el;
            this.$list.append(tmp);

        }

    });
})(jQuery);
