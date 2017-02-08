

RDBHOST as WEBSITE BACKEND
==========================


The jquery.rdbhost.js module provides an interface for
safely accessing Rdbhost databases from any Website.  This
bundle includes javascript libraries necessary for an
Rdbhost backed app.

Unzip the bundle into a convenient directory somewhere. If you
do not have an Apache server installed, you can use one of the
included servers.

LOCAL STATIC WEB SERVER
-----------------------

On Windows, you can run tiny.exe, a simple web server; from a
shell in the jsplain directory, enter:
cd tools
server.bat

If Python is installed on your machine, you can run the server:
tools\server.py
If Ruby is installed, use the Ruby version:
tools\server.rb

Either of these creates a static http server, and the index
page can be requested from a web browser at
http://localhost:8000 .


DVD DB DEMO
-----------

The included pages implement a simple DVD database.  The first
'dvddb_super.html' uses the Super database role exclusively,
and assumes the user can be trusted not to maliciously recode
the script.  You would use this one yourself, to set things up.
On a production website, you would want to 1)erase this page,
or 2) password protect the page with server access controls, or
3) edit the authcode data out, and look up the authcode online
using the account password entered in a web-form when the page
is viewed.

The second page 'dvddb_preauth.html' uses the Preauth role. You
would use this to train the server account white-list, and it would
be used by the nominal app user to re-run white-listed queries.
You should enable Training Mode from the website profile page
before viewing this page, and (IMPORTANT!) disable Training Mode
afterwards.


EMAILING DEMO
-------------

The 'email_super.html' page has links to create an apikey table
on the server, storing your emailYak api key.  First create an account
on EmailYak, and cut-and-paste the source email and the apikey into
both this page.  Then load the page, and click the link; the apikey
will be stored on the server.

The 'email_preauth.html' page has a form for sending an email via EmailYak.
Send an email while your account is in training mode in order to add the
emailing query to the white-list.


OPENID DEMO
-----------

The 'openid_super.html' page is optional here, as all necessary setup
is done by the server when you enable OpenID.  The page is included as
a reference, a modified version can setup a different configuration for
handling OpenID logins.  The schema and function must be named as in the
'openid_super.html' page, and must have the same parameter list and
return value (the same signature).

The 'openid_reader.html' page demonstrates logging in via OpenId.  There is
no training required.


TESTS
-----

There is a test suite at /test/index.html.  These are QUnit
based JavaScript tests.

