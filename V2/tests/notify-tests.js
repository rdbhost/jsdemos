

var host = window.location.href.indexOf('dev') > -1 ? 'dev.rdbhost.com' : 'www.rdbhost.com';

QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
    assert.ok(Rdbhost, 'Rdbhost there');
});


QUnit.test('Notify From Function', function(assert) {

    var done = assert.async();
    var notifyrecd = false;

    Rdbhost.once('notify-received:abc', function f(ch, pl) {
        assert.ok('event', 'notify event received');
        assert.ok(ch === 'abc', 'channel is correct');
        assert.ok(pl.substr(0,5) === 'ooooh', 'payload is correct');
        notifyrecd = true;
    });

    Rdbhost.connect(host, 14);

    var q = "\
    CREATE OR REPLACE FUNCTION pg_temp.oooh(_i VARCHAR) RETURNS void \n\
    LANGUAGE plpgsql AS $$ \n\
    BEGIN \n\
     PERFORM pg_notify('abc', _i); \n\
    END; \n\
    $$; \n\
    SELECT pg_temp.oooh(%s); \n\
    -- INSERT INTO realtime.chat (usr, message) VALUES (%[REMOTE_ADDR]s, s);\n";

    var e = Rdbhost.reader()
        .query(q)
        .params(['ooooh'])
        .listen('abc');

    var p = e.get_data();

    assert.ok(p.constructor.toString().indexOf('Promise') >= 0, 'promise is object');
    p.then(function(d) {
        assert.ok(true, 'then called');
        assert.ok(d.result_sets.length >= 2, 'result_sets len');

        assert.ok(notifyrecd, 'notify recieved');

        if ( notifyrecd ) {
            clearTimeout(st);
            done();
        }
        else
            throw new Error('');
    })
        .catch(function(e) {
            assert.ok(false, 'then error called '+e.message);
            clearTimeout(st);
            done();
        });

    var st = setTimeout(function() { done(); }, 1000);
});


QUnit.test('Notify From Trigger', function(assert) {

    var done = assert.async();
    var notifyrecd = false;

    Rdbhost.once('notify-received:abc', function f(ch, pl) {
        assert.ok('event', 'notify event received');
        assert.ok(ch === 'abc', 'channel is correct');
        assert.ok(pl.substr(0,5) === 'ooooh', 'payload is correct');
        notifyrecd = true;
    });

    Rdbhost.connect(host, 14);

    var q = "\
    CREATE OR REPLACE FUNCTION pg_temp.oooh() RETURNS trigger \n\
    LANGUAGE plpgsql AS $$ \n\
    BEGIN \n\
     PERFORM pg_notify('abc', NEW.message); \n\
     RETURN NULL; \n\
    END; \n\
    $$; \n\
    \n\
    CREATE TRIGGER rtchat AFTER INSERT \n\
     ON realtime.chat \n\
     FOR EACH ROW \n\
     EXECUTE PROCEDURE pg_temp.oooh(); \n\
    \n\
    INSERT INTO realtime.chat (usr, message) VALUES (%[REMOTE_ADDR]s, %s); \n";

    // q = "INSERT INTO realtime.chat (usr, message) VALUES (%[REMOTE_ADDR]s, %s);\n";

    var e = Rdbhost.reader()
        .query(q)
        .params(['ooooh'])
        .listen('abc');

    var p = e.get_data();

    assert.ok(p.constructor.toString().indexOf('Promise') >= 0, 'promise is object');
    p.then(function(d) {
        assert.ok(true, 'then called');
        assert.ok(d.result_sets.length >= 2, 'result_sets len');

        if ( notifyrecd ) {
            clearTimeout(st);
            done();
        }
        else
            throw new Error('');
    })
        .catch(function(e) {
            assert.ok(false, 'then error called '+e.message);
            clearTimeout(st);
            done();
        });

    var st = setTimeout(function() { done(); }, 1000);
});