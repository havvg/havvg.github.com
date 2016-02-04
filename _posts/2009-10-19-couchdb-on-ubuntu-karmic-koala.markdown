--- 
layout: post
title: couchdb on ubuntu Karmic Koala
---
## Connection refused

I need couchdb 0.10.0 as it provides JSONP support, so I installed the bleeding edge ubuntu Karmic Koala development branch, which ships couchdb 0.10.0. But when doing a simple curl request on the couchdb server, the connection was refused.

```bash
$ curl -vX GET http://127.0.0.1:5984
* About to connect() to 127.0.0.1 port 5984 (#0)
*   Trying 127.0.0.1... Connection refused
* couldn't connect to host
* Closing connection #0
curl: (7) couldn't connect to host
```

To check what's wrong use this command.

```bash
$ sudo -u couchdb couchdb
 
=ERROR REPORT==== 19-Oct-2009::21:49:09 ===
file:path_eval([".","/root"],".erlang"): permission denied
Apache CouchDB 0.10.0 (LogLevel=info) is starting.
Apache CouchDB has started. Time to relax.
[info] [<0.1.0>] Apache CouchDB has started on http://127.0.0.1:5984/
```

What's important on this output is the **permission denied** error. In order to get this solved, you can either change the log section in your `/etc/couchdb/local.ini` to a logfile couchdb is allowed to write to or you add the directory and the file with correct permissions that is defined in the `/etc/couchdb/default.ini` as follows.

```bash
$ mkdir -p /var/log/couchdb/0.10.0/
$ touch /var/log/couchdb/0.10.0/couch.log 
$ chown -R couchdb:adm /var/log/couchdb/
```

Now the logfile is setup correctly and you may request couchdb.

```bash
$ curl -X GET http://127.0.0.1:5984
{"couchdb":"Welcome","version":"0.10.0"}
 
$ curl -X GET http://127.0.0.1:5984?callback=fnName
fnName({"couchdb":"Welcome","version":"0.10.0"});
```

Thanks to a lot of mail archives, that pointed me to what could be wrong (and finally I got it :D).
