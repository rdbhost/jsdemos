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

    function addStatusLine(str) {

        var statModel = new Backbone.Model({s: str}),
            statRow = new app.StatusRow({model: statModel});
        $('ul.listNone').append(statRow.render().el);
    }

    app.EmailConfigureView = Backbone.View.extend({

        tagName: 'div',

        // The DOM events specific to an item.
        events: {
            'click #create-email-btn':  'createEmailBtn'
        },

        template: _.template($('#eml-configure-template').html()),

        // Re-render the titles of the thread item.
        render: function () {

            this.$el.html(this.template(this.model));
            this.$el.show();

            $('#page').html(this.el);

            return this;
        },

        createEmailBtn: function() {

            var $emailForm = this.$el.find('#emailapi'),
                svc = $emailForm.find('#emservice').val(),
                apikey = $emailForm.find('#emapikey').val(),
                acctemail = $emailForm.find('#acctemail').val(),
                webmaster = $emailForm.find('#webmaster').val();

            var p = R.setupEmail({

                service: svc,
                apikey: apikey,
                acctemail: acctemail,
                webmaster: webmaster
            });

            p.done(function (resp) {

                addStatusLine('email api key added to apis table');
            });
            p.fail(function (errArray) {

                addStatusLine('email api key addition failed! ' + errArray[1]);
            });

            return false;
        }
    });


    function followUpEmailing(resp) {

        var httpStat = resp.status[0];
        if (httpStat === 'error') {

            addStatusLine('<div>Email was not Sent %s</div>'.replace('%s', resp.error[1]));
        }
        else {

            if (resp.row_count[0] === 0) {

                addStatusLine('No emails were sent, maybe api key is missing from apis table.')
            }
            else {

                var stat = resp.records.rows[0].result;
                if (stat === 'Success') {

                    addStatusLine('<div>Email was sent successfully</div>');
                }
                else {

                    addStatusLine('<div>Error: %s</div>'.replace('%s', stat));
                }
            }
        }
    }

    // The DOM element for a thread item...
	app.EmailingView = Backbone.View.extend({

        tagName: 'div',

        // The DOM events specific to an item.
        events: {
            'click #send-email-btn':  'sendEmailBtn'
        },

        template: _.template($('#eml-preauth-template').html()),

        // Re-render the titles of the thread item.
        render: function () {

            this.$el.html(this.template(this.model));
            this.$el.show();

            $('#page').html(this.el);

            return this;
        },

        sendEmailBtn: function() {

            var body = $('#emailBody').val();

            var p = R.emailWebmaster({

                bodyString: body,
                // replyTo: js@travelbyroad.net',
                subject: 'test subject'
            });

            p.then(function (resp) {

                    followUpEmailing(resp);
                },
                function (errArry) {

                    addStatusLine('<div>Error: %s</div>'.replace('%s', errArry[1]));
                }
            );

            return false;
        }
    });

})(jQuery);
