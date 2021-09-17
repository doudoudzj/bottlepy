# Bottle: Python Web Framework

Bottle is a fast, simple and lightweight [WSGI](http://www.wsgi.org/) micro web-framework for [Python](http://python.org/). It is distributed as a single file module and has no dependencies other than the [Python Standard Library](http://docs.python.org/library/).

-   **Routing:** Requests to function-call mapping with support for clean and dynamic URLs.
-   **Templates:** Fast and pythonic [built-in template engine](tutorial.md#tutorial-templates) and support for [mako](http://www.makotemplates.org/), [jinja2](http://jinja.pocoo.org/) and [cheetah](http://www.cheetahtemplate.org/) templates.
-   **Utilities:** Convenient access to form data, file uploads, cookies, headers and other HTTP-related metadata.
-   **Server:** Built-in HTTP development server and support for [paste](http://pythonpaste.org/), [fapws3](https://github.com/william-os4y/fapws3), [bjoern](https://github.com/jonashaag/bjoern), [Google App Engine](http://code.google.com/intl/en-US/appengine/), [cherrypy](http://www.cherrypy.org/) or any other [WSGI](http://www.wsgi.org/) capable HTTP server.

Example: “Hello World” in a bottle

```python
from bottle import route, run, template

@route('/hello/<name>')
def index(name):
    return template('<b>Hello {{name}}</b>!', name=name)

run(host='localhost', port=8080)
```

Run this script or paste it into a Python console, then point your browser to http://localhost:8080/hello/world. That’s it.

Download and Install

Install the latest stable release via [PyPI](http://pypi.python.org/pypi/bottle) (`easy_install -U bottle`) or download [bottle.py](https://github.com/defnull/bottle/raw/master/bottle.py) (unstable) into your project directory. There are no hard [[1\]](#id3) dependencies other than the Python standard library. Bottle runs with **Python 2.5+ and 3.x**.
