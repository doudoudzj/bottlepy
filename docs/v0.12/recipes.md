# Recipes

This is a collection of code snippets and examples for common use cases.

## KEEPING TRACK OF SESSIONS

There is no built-in support for sessions because there is no _right_ way to do it (in a micro framework). Depending on requirements and environment you could use [beaker](http://beaker.groovie.org/) middleware with a fitting backend or implement it yourself. Here is an example for beaker sessions with a file-based backend:

```python
import bottle
from beaker.middleware import SessionMiddleware

session_opts = {
    'session.type': 'file',
    'session.cookie_expires': 300,
    'session.data_dir': './data',
    'session.auto': True
}
app = SessionMiddleware(bottle.app(), session_opts)

@bottle.route('/test')
def test():
  s = bottle.request.environ.get('beaker.session')
  s['test'] = s.get('test',0) + 1
  s.save()
  return 'Test counter: %d' % s['test']

bottle.run(app=app)
```

## DEBUGGING WITH STYLE: DEBUGGING MIDDLEWARE

Bottle catches all Exceptions raised in your app code to prevent your WSGI server from crashing. If the built-in [`debug()`](api.md#bottle.debug) mode is not enough and you need exceptions to propagate to a debugging middleware, you can turn off this behaviour:

```python
import bottle
app = bottle.app()
app.catchall = False #Now most exceptions are re-raised within bottle.
myapp = DebuggingMiddleware(app) #Replace this with a middleware of your choice (see below)
bottle.run(app=myapp)
```

Now, bottle only catches its own exceptions ([`HTTPError`](api.md#bottle.HTTPError), [`HTTPResponse`](api.md#bottle.HTTPResponse) and [`BottleException`](api.md#bottle.BottleException)) and your middleware can handle the rest.

The [werkzeug](http://werkzeug.pocoo.org/documentation/dev/debug.html) and [paste](http://pythonpaste.org/modules/evalexception.html) libraries both ship with very powerful debugging WSGI middleware. Look at [`werkzeug.debug.DebuggedApplication`](https://werkzeug.palletsprojects.com/en/2.0.x/debug/#werkzeug.debug.DebuggedApplication) for [werkzeug](http://werkzeug.pocoo.org/documentation/dev/debug.html) and `paste.evalexception.middleware.EvalException` for [paste](http://pythonpaste.org/modules/evalexception.html). They both allow you do inspect the stack and even execute python code within the stack context, so **do not use them in production**.

## UNIT-TESTING BOTTLE APPLICATIONS

Unit-testing is usually performed against methods defined in your web application without running a WSGI environment.

A simple example using [Nose](http://readthedocs.org/docs/nose):

```python
import bottle

@bottle.route('/')
def index():
    return 'Hi!'

if __name__ == '__main__':
    bottle.run()
```

Test script:

```python
import mywebapp

def test_webapp_index():
    assert mywebapp.index() == 'Hi!'
```

In the example the Bottle route() method is never executed - only index() is tested.

## FUNCTIONAL TESTING BOTTLE APPLICATIONS

Any HTTP-based testing system can be used with a running WSGI server, but some testing frameworks work more intimately with WSGI, and provide the ability the call WSGI applications in a controlled environment, with tracebacks and full use of debugging tools. [Testing tools for WSGI](http://www.wsgi.org/en/latest/testing.html) is a good starting point.

Example using [WebTest](http://webtest.pythonpaste.org/) and [Nose](http://readthedocs.org/docs/nose):

```python
from webtest import TestApp
import mywebapp

def test_functional_login_logout():
    app = TestApp(mywebapp.app)

    app.post('/login', {'user': 'foo', 'pass': 'bar'}) # log in and get a cookie

    assert app.get('/admin').status == '200 OK'        # fetch a page successfully

    app.get('/logout')                                 # log out
    app.reset()                                        # drop the cookie

    # fetch the same page, unsuccessfully
    assert app.get('/admin').status == '401 Unauthorized'
```

## EMBEDDING OTHER WSGI APPS

This is not the recommend way (you should use a middleware in front of bottle to do this) but you can call other WSGI applications from within your bottle app and let bottle act as a pseudo-middleware. Here is an example:

```python
from bottle import request, response, route
subproject = SomeWSGIApplication()

@route('/subproject/:subpath#.*#', method='ANY')
def call_wsgi(subpath):
    new_environ = request.environ.copy()
    new_environ['SCRIPT_NAME'] = new_environ.get('SCRIPT_NAME','') + '/subproject'
    new_environ['PATH_INFO'] = '/' + subpath
    def start_response(status, headerlist):
        response.status = int(status.split()[0])
        for key, value in headerlist:
            response.add_header(key, value)
    return app(new_environ, start_response)
```

Again, this is not the recommend way to implement subprojects. It is only here because many people asked for this and to show how bottle maps to WSGI.

## IGNORE TRAILING SLASHES

For Bottle, `/example` and `/example/` are two different routes [Because they are. See](http://www.ietf.org/rfc/rfc3986.txt). To treat both URLs the same you can add two `@route` decorators:

```python
@route('/test')
@route('/test/')
def test(): return 'Slash? no?'
```

or add a WSGI middleware that strips trailing slashes from all URLs:

```python
class StripPathMiddleware(object):
  def __init__(self, app):
    self.app = app
  def __call__(self, e, h):
    e['PATH_INFO'] = e['PATH_INFO'].rstrip('/')
    return self.app(e,h)

app = bottle.app()
myapp = StripPathMiddleware(app)
bottle.run(app=myapp)
```


## KEEP-ALIVE REQUESTS

Note

For a more detailed explanation, see [Primer to Asynchronous Applications](async.md).

Several “push” mechanisms like XHR multipart need the ability to write response data without closing the connection in conjunction with the response header “Connection: keep-alive”. WSGI does not easily lend itself to this behavior, but it is still possible to do so in Bottle by using the [gevent](http://www.gevent.org/) async framework. Here is a sample that works with either the [gevent](http://www.gevent.org/) HTTP server or the [paste](http://pythonpaste.org/modules/evalexception.md) HTTP server (it may work with others, but I have not tried). Just change `server='gevent'` to `server='paste'` to use the [paste](http://pythonpaste.org/modules/evalexception.md) server:

```python
from gevent import monkey; monkey.patch_all()

import time
from bottle import route, run

@route('/stream')
def stream():
    yield 'START'
    time.sleep(3)
    yield 'MIDDLE'
    time.sleep(5)
    yield 'END'

run(host='0.0.0.0', port=8080, server='gevent')
```

If you browse to `http://localhost:8080/stream`, you should see ‘START’, ‘MIDDLE’, and ‘END’ show up one at a time (rather than waiting 8 seconds to see them all at once).

## GZIP COMPRESSION IN BOTTLE

Note

For a detailed discussion, see [compression](https://github.com/defnull/bottle/issues/92)

A common feature request is for Bottle to support Gzip compression, which speeds up sites by compressing static resources (like CSS and JS files) during a request.

Supporting Gzip compression is not a straightforward proposition, due to a number of corner cases that crop up frequently. A proper Gzip implementation must:

-   Compress on the fly and be fast doing so.
-   Do not compress for browsers that don’t support it.
-   Do not compress files that are compressed already (images, videos).
-   Do not compress dynamic files.
-   Support two differed compression algorithms (gzip and deflate).
-   Cache compressed files that don’t change often.
-   De-validate the cache if one of the files changed anyway.
-   Make sure the cache does not get to big.
-   Do not cache small files because a disk seek would take longer than on-the-fly compression.

Because of these requirements, it is the recommendation of the Bottle project that Gzip compression is best handled by the WSGI server Bottle runs on top of. WSGI servers such as [cherrypy](http://www.cherrypy.org/) provide a [GzipFilter](http://www.cherrypy.org/wiki/GzipFilter) middleware that can be used to accomplish this.

## USING THE HOOKS PLUGIN

For example, if you want to allow Cross-Origin Resource Sharing for the content returned by all of your URL, you can use the hook decorator and setup a callback function:

```python
from bottle import hook, response, route

@hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'

@route('/foo')
def say_foo():
    return 'foo!'

@route('/bar')
def say_bar():
    return {'type': 'friendly', 'content': 'Hi!'}
```

You can also use the `before_request` to take an action before every function gets called.

## USING BOTTLE WITH HEROKU

[Heroku](http://heroku.com/), a popular cloud application platform now provides support for running Python applications on their infastructure.

This recipe is based upon the [Heroku Quickstart](http://devcenter.heroku.com/articles/quickstart), with Bottle specific code replacing the [Write Your App](http://devcenter.heroku.com/articles/python#write_your_app) section of the [Getting Started with Python on Heroku/Cedar](http://devcenter.heroku.com/articles/python) guide:

```python
import os
from bottle import route, run

@route("/")
def hello_world():
        return "Hello World!"

run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
```

Heroku’s app stack passes the port that the application needs to listen on for requests, using the os.environ dictionary.
