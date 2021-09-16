# Bottle: Python Web Framework

Bottle is a fast, simple and lightweight WSGI micro web-framework for Python. It is distributed as a single file module and has no dependencies other than the Python Standard Library.

-   Routing: Requests to function-call mapping with support for clean and dynamic URLs.
-   Templates: Fast and pythonic built-in template engine and support for mako, jinja2 and cheetah templates.
-   Utilities: Convenient access to form data, file uploads, cookies, headers and other HTTP-related metadata.
-   Server: Built-in HTTP development server and support for paste, bjoern, gae, cherrypy or any other WSGI capable HTTP server.

## Example: “Hello World” in a bottle

```python
from bottle import route, run, template

@route('/hello/<name>')
def index(name):
    return template('<b>Hello {{name}}</b>!', name=name)

run(host='localhost', port=8080)
```


Run this script or paste it into a Python console, then point your browser to http://localhost:8080/hello/world. That’s it.

## Download and Install

Install the latest stable release with pip install bottle or download bottle.py (unstable) into your project directory. There are no hard [1] dependencies other than the Python standard library. Bottle supports Python 2.7 and Python 3.

Deprecated since version 0.13: Support for Python 2.5 and 2.6 was dropped with this release.

