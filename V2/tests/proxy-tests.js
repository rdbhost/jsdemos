

var host = window.location.href.indexOf('dev') > -1 ? 'dev.rdbhost.com' : 'www.rdbhost.com';

QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
    assert.ok(Rdbhost, 'Rdbhost there');
});

QUnit.test('proxy Twitter test', function(assert) {

    var done = assert.async();

    var q = " \
  SELECT 'url'::TEXT as \"category\", Null::TEXT as \"idx\", 'POST'::TEXT as \"name\", 'https://api.twitter.com/oauth2/token'::TEXT as \"value\" \n \
 -- RECORD: 'url', Null, 'POST', 'https://api.....' \n \
\
   UNION SELECT * FROM (\n \
 SELECT 'header'::TEXT as \"category\", Null::TEXT as \"idx\", 'Authorization'::TEXT as \"name\", \
        'Basic ' || replace(encode(tk.client_key::BYTEA || ':'::BYTEA || tk.client_secret::BYTEA, 'base64'::TEXT), chr(10), '') as \"value\" \n \
     FROM auth.fedoauth_providers tk WHERE provider = 'Twitter' LIMIT 1 ) AS _r \n \
 -- RECORD: 'header', Null, 'Authorization', 'Basic .....' \n \
\
   UNION \n \
 SELECT 'header'::TEXT as \"category\", Null::TEXT as \"idx\", 'Content-Type'::TEXT as \"name\", 'application/x-www-form-urlencoded;charset=UTF-8'::TEXT as \"value\" \n \
 -- RECORD: 'header', Null, 'Content-Type', 'application/x-www.......' \n \
\
   UNION \n \
 SELECT 'body'::TEXT as \"category\", Null::TEXT as \"idx\", ''::TEXT as \"name\", 'grant_type=client_credentials'::TEXT as \"value\" \n \
 -- RECORD: 'body', Null, '', 'grant_type=client_credentials'";

    Rdbhost.connect(host, 14);

    var pr = Rdbhost.preauth()
        .query(q)
        .proxy('proxy')
        .get_data();

    pr.then(function(d) {

        assert.ok(d, 'ok');
        var jsn = d.result_sets[0].records.rows[0].result,
            data = JSON.parse(jsn.result);
        assert.ok(data.token_type === 'bearer');
        done();
    })
    .catch(function(e) {
        assert.ok(! e, e.message);
        done();
    })

});


QUnit.test('proxy Mailgun test', function(assert) {

    var done = assert.async();

    var q = " \
  SELECT 'url', Null, 'POST', \n \
         'https://api.mailgun.net/v2/sandboxd0ba1f4751cf4b7894f3ff1204175f38.mailgun.org/messages'\n \
    UNION\n \
  SELECT 'auth', Null, 'api', apikey FROM auth.apikeys WHERE service = 'mailgun'\n \
    UNION \n \
  SELECT 'field', Null, 'from', 'rdbhost@sandboxd0ba1f4751cf4b7894f3ff1204175f38.mailgun.org' \n \
    UNION \n \
  SELECT 'field', Null, 'to', 'dvk@travelbyroad.net' \n \
    UNION \n \
  SELECT 'field', Null, 'subject', 'Demo Email' \n \
    UNION \n \
  SELECT 'field', Null, 'text', 'This demo email was sent via rdbhost proxy' \n \
    UNION \n \
  SELECT 'field', Null, 'html', 'This &lt;b&gt;demo email&lt;/b&gt; was sent via rdbhost proxy' \n \
";

    Rdbhost.connect(host, 14);

    var pr = Rdbhost.preauth()
        .query(q)
        .proxy('proxy')
        .get_data();

    pr.then(function(d) {

        assert.ok(d, 'ok');
        var jsn = d.result_sets[0].records.rows[0].result,
            data = JSON.parse(jsn.result);
        assert.ok(data.message.indexOf('Queued. Thank') >-1, 'bad response' );
        done();
    })
    .catch(function(e) {
        assert.ok(! e, e.message);
        done();
     })

});


QUnit.test('proxy Mastodon test', function(assert) {

    var done = assert.async();

    var q = " \
SELECT 'url', NULL::int, 'GET',  \
  'https://mastodon.social/api/v1/timelines/public' \
  UNION \
SELECT 'field', 1, 'since_id', %(since_id)s::text;   ";

    Rdbhost.connect(host, 14);

    var pr = Rdbhost.preauth()
        .query(q)
        .params({'since_id': 1000})
        .proxy('proxy')
        .get_data();


    pr.then(function(d) {

        assert.ok(d, 'ok');
        var jsn = d.result_sets[0].records.rows[0].result,
            data = JSON.parse(jsn.result);
        assert.ok(data.length > 1, 'some statuses found' );
        done();
    })
    .catch(function(e) {
        assert.ok(! e, e.message);
        done();
    })

});