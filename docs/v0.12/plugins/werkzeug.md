---
sidebar: auto
---

# Bottle-Werkzeug

[Werkzeug](http://werkzeug.pocoo.org/) is a powerful WSGI utility library for Python. It includes an interactive debugger and feature-packed request and response objects.

This plugin integrates [`werkzeug.wrappers.Request`](https://werkzeug.palletsprojects.com/en/2.0.x/wrappers/#werkzeug.wrappers.Request) and [`werkzeug.wrappers.Response`](https://werkzeug.palletsprojects.com/en/2.0.x/wrappers/#werkzeug.wrappers.Response) as an alternative to the built-in implementations, adds support for [`werkzeug.exceptions`](https://werkzeug.palletsprojects.com/en/2.0.x/exceptions/#module-werkzeug.exceptions) and replaces the default error page with an interactive debugger.

## INSTALLATION

Install with one of the following commands:

```
$ pip install bottle-werkzeug
$ easy_install bottle-werkzeug
```

or download the latest version from github:

```
$ git clone git://github.com/defnull/bottle.git
$ cd bottle/plugins/werkzeug
$ python setup.py install
```

## USAGE

Once installed to an application, this plugin adds support for [`werkzeug.wrappers.Response`](https://werkzeug.palletsprojects.com/en/2.0.x/wrappers/#werkzeug.wrappers.Response), all kinds of [`werkzeug.exceptions`](https://werkzeug.palletsprojects.com/en/2.0.x/exceptions/#module-werkzeug.exceptions) and provides a thread-local instance of [`werkzeug.wrappers.Request`](https://werkzeug.palletsprojects.com/en/2.0.x/wrappers/#werkzeug.wrappers.Request) that is updated with each request. The plugin instance itself doubles as a werkzeug module object, so you don’t have to import werkzeug in your application. Here is an example:

```python
import bottle
from bottle.ext import werkzeug

app = bottle.Bottle()
werkzeug = werkzeug.Plugin()
app.install(werkzeug)

req = werkzeug.request # For the lazy.

@app.route('/hello/:name')
def say_hello(name):
    greet = {'en':'Hello', 'de':'Hallo', 'fr':'Bonjour'}
    language = req.accept_languages.best_match(greet.keys())
    if language:
        return werkzeug.Response('%s %s!' % (greet[language], name))
    else:
        raise werkzeug.exceptions.NotAcceptable()
```

## USING THE DEBUGGER

This plugin replaces the default error page with an advanced debugger. If you have the evalex feature enabled, you will get an interactive console that allows you to inspect the error context in the browser. Please read [Debugging Applications with werkzeug](werkzeug:debug) before you enable this feature.

## CONFIGURATION

The following configuration options exist for the plugin class:

-   **evalex**: Enable the exception evaluation feature (interactive debugging). This requires a non-forking server and is a security risk. Please read [Debugging Applications with werkzeug](werkzeug:debug). (default: False)
-   **request_class**: Defaults to [`werkzeug.wrappers.Request`](https://werkzeug.palletsprojects.com/en/2.0.x/wrappers/#werkzeug.wrappers.Request)
-   **debugger_class**: Defaults to a subclass of [`werkzeug.debug.DebuggedApplication`](https://werkzeug.palletsprojects.com/en/2.0.x/debug/#werkzeug.debug.DebuggedApplication) which obeys the `bottle.DEBUG` setting.
