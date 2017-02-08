/**
 * Created by David on 10/26/13.
 */

'use strict';


if ( ! 'Rdbhost' in window )
    window.Rdbhost = {};
if ( ! 'Angular' in window.Rdbhost || ! window.Rdbhost.Angular )
    window.Rdbhost.Angular = {};


(function() {

    var t = {

        providerInit: function($httpProvider) {

            // Use x-www-form-urlencoded Content-Type
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

            // Remove X-Requested-With header to avoid browser making OPTIONS request
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            // Override $http service's default transformRequest
            $httpProvider.defaults.transformRequest = [function(data) {

                return angular.isObject(data) && String(data) !== '[object File]' ? $.param(data) : data;
            }];
        },


        makeRdbHttp: function($http, $q) {

            function http_decorated(qPromise, cfg) {

                // these two methods copied from angular.js
                // they add success and error callbacks to generic promise
                qPromise.success = function(fn) {
                    qPromise.then(function(response) {
                        fn(response.data, response.status, response.headers, cfg);
                    });
                    return qPromise;
                };

                qPromise.error = function(fn) {
                    qPromise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, cfg);
                    });
                    return qPromise;
                };

                return qPromise;
            }

            function rdbhttp(opts) {

                var q = $q.defer(),
                    p = $http(opts);

                p.success(function (resp, status, headers, config) {

                    // need to feed response to error( ) even if error is communicated in status field
                    if ( resp.status[0] === 'error' ) {

                        q.reject({ data: resp, status: status, headers: headers, config: config});
                    }
                    else {

                        q.resolve({ data: resp, status: status, headers: headers, config: config});
                    }
                });

                p.error(function (data, status, headers, config) {

                    q.reject({ data: data, status: status, headers: headers, config: config});
                });

                return http_decorated(q.promise, opts);
            }

            rdbhttp.post = function( url, data, cfg ) {

                cfg = cfg || {};
                cfg.method = 'POST';
                cfg.data = data;
                cfg.url = url;

                return rdbhttp(cfg);
            };

            rdbhttp.get = function( url, cfg ) {

                cfg = cfg || {};
                cfg.method = 'GET';
                cfg.url = url;

                return rdbhttp(cfg);
            };

            rdbhttp.jsonp = rdbhttp.head = rdbhttp.delete =
                rdbhttp.remove = rdbhttp.put = function() { throw new Error('not implemented') };

            // provide decorated function to caller
            return rdbhttp;
        },


        rdbhostTransformResponseFactory: function(isArray) {

            return function(data, headerGetter) {

                data = JSON.parse(data);

                if ( data.status[0] === 'error' )
                    throw new Error(data.error);

                if ( data.status[0] !== 'error' && data.records && data.records.rows )
                    return isArray ? data.records.rows  : data.records.rows;
                else
                    return isArray ? [] : {};
            }
        },

        rdbhostTransformRequest: function(data, headerGetter) {

            if ( data && typeof(data) === 'object' ) {

                var rdbData = {};
                $.each(data, function(k, v) {

                    rdbData['arg:'+k] = v;
                });

                return angular.isObject(rdbData) && String(rdbData) !== '[object File]' ? $.param(rdbData) : rdbData;
            }
            else {
                return '';
            }
        }
    };

    $.extend(Rdbhost.Angular, t);

})();
