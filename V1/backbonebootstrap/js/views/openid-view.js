/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY, Showdown */

(function ($) {
	'use strict';

    var R = window.Rdbhost;

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

    app.OpenIDView = Backbone.View.extend({

        tagName: 'div',

        template: _.template($('#oid-preauth-template').html()),

        // Re-render the titles of the thread item.
        render: function () {

            this.$el.html(this.template(this.model));
            this.$el.show();

            $('#page').html(this.el);

            R.loginOpenId({
                'loginForm': 'openidForm',
                'callback': function() { },
                'errback' : function() { }
            });

            if ( app.loginId )
                addStatusLine('you are logged in as ' + app.loginId);

            return this;
        }



    });

})(jQuery);
