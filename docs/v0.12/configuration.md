---
sidebar: auto
---

# Configuration (DRAFT)

Bottle applications can store their configuration in [`Bottle.config`](api.md#bottle.Bottle.config), a dict-like object and central place for application specific settings. This dictionary controls many aspects of the framework, tells (newer) plugins what to do, and can be used to store your own configuration as well.

## Configuration Basics

The [`Bottle.config`](api.md#bottle.Bottle.config) object behaves a lot like an ordinary dictionary. All the common dict methods work as expected. Let us start with some examples:

```python
import bottle
app = bottle.default_app()             # or bottle.Bottle() if you prefer

app.config['autojson']    = False      # Turns off the "autojson" feature
app.config['sqlite.db']   = ':memory:' # Tells the sqlite plugin which db to use
app.config['myapp.param'] = 'value'    # Example for a custom config value.

# Change many values at once
app.config.update({
    'autojson': False,
    'sqlite.db': ':memory:',
    'myapp.param': 'value'
})

# Add default values
app.config.setdefault('myapp.param2', 'some default')

# Receive values
param  = app.config['myapp.param']
param2 = app.config.get('myapp.param2', 'fallback value')

# An example route using configuration values
@app.route('/about', view='about.rst')
def about():
    email = app.config.get('my.email', 'nomail@example.com')
    return {'email': email}
```

The app object is not always available, but as long as you are within a request context, you can use the request object to get the current application and its configuration:

```python
from bottle import request
def is_admin(user):
    return user == request.app.config['myapp.admin_user']
```

## Naming Convention

To make life easier, plugins and applications should follow some simple rules when it comes to config parameter names:

-   All keys should be lowercase strings and follow the rules for python identifiers (no special characters but the underscore).
-   Namespaces are separated by dots (e.g. `namespace.field` or `namespace.subnamespace.field`).
-   Bottle uses the root namespace for its own configuration. Plugins should store all their variables in their own namespace (e.g. `sqlite.db` or `werkzeug.use_debugger`).
-   Your own application should use a separate namespace (e.g. `myapp.*`).

## Loading Configuration from a File

Configuration files are useful if you want to enable non-programmers to configure your application, or just don’t want to hack python module files just to change the database port. A very common syntax for configuration files is shown here:

```ini
[bottle]
debug = True

[sqlite]
db = /tmp/test.db
commit = auto

[myapp]
admin_user = defnull
```

With [`ConfigDict.load_config()`](configuration.md#bottle.ConfigDict.load_config) you can load these `*.ini` style configuration files from disk and import their values into your existing configuration:

```python
app.config.load_config('/etc/myapp.conf')
```

## Loading Configuration from a nested [`dict`](https://docs.python.org/3/library/stdtypes.html#dict)

Another useful method is [`ConfigDict.load_dict()`](configuration.md#bottle.ConfigDict.load_dict). This method takes an entire structure of nested dictionaries and turns it into a flat list of keys and values with namespaced keys:

```python
# Load an entire dict structure
app.config.load_dict({
    'autojson': False,
    'sqlite': { 'db': ':memory:' },
    'myapp': {
        'param': 'value',
        'param2': 'value2'
    }
})

assert app.config['myapp.param'] == 'value'

# Load configuration from a json file
with open('/etc/myapp.json') as fp:
    app.config.load_dict(json.load(fp))
```

## Listening to configuration changes

The `config` hook on the application object is triggered each time a value in [`Bottle.config`](api.md#bottle.Bottle.config) is changed. This hook can be used to react on configuration changes at runtime, for example reconnect to a new database, change the debug settings on a background service or resize worker thread pools. The hook callback receives two arguments (key, new_value) and is called before the value is actually changed in the dictionary. Raising an exception from a hook callback cancels the change and the old value is preserved.

```python
@app.hook('config')
def on_config_change(key, value):
  if key == 'debug':
      switch_own_debug_mode_to(value)
```

The hook callbacks cannot _change_ the value that is to be stored to the dictionary. That is what filters are for.

## Filters and other Meta Data

[`ConfigDict`](configuration.md#bottle.ConfigDict) allows you to store meta data along with configuration keys. Two meta fields are currently defined:

-   help

    A help or description string. May be used by debugging, introspection or admin tools to help the site maintainer configuring their application.

-   filter

    A callable that accepts and returns a single value. If a filter is defined for a key, any new value stored to that key is first passed through the filter callback. The filter can be used to cast the value to a different type, check for invalid values (throw a ValueError) or trigger side effects.

This feature is most useful for plugins. They can validate their config parameters or trigger side effects using filters and document their configuration via `help` fields:

```python
class SomePlugin(object):
    def setup(app):
        app.config.meta_set('some.int', 'filter', int)
        app.config.meta_set('some.list', 'filter',
            lambda val: str(val).split(';'))
        app.config.meta_set('some.list', 'help',
            'A semicolon separated list.')

    def apply(self, callback, route):
        ...

import bottle
app = bottle.default_app()
app.install(SomePlugin())

app.config['some.list'] = 'a;b;c'     # Actually stores ['a', 'b', 'c']
app.config['some.int'] = 'not an int' # raises ValueError
```

## API Documentation

class **ConfigDict**(`*a, **ka`) [source](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict)

A dict-like configuration storage with additional support for namespaces, validators, meta-data, on_change listeners and more.

This storage is optimized for fast read access. Retrieving a key or using non-altering dict methods (e.g. dict.get()) has no overhead compared to a native dict.

**load_config**(`_filename_`) [source](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict.load_config)

Load values from an \*.ini style config file. If the config file contains sections, their names are used as namespaces for the values within. The two special sections `DEFAULT` and `bottle` refer to the root namespace (no prefix).

**load_dict**(`_source_, _namespace=''_, _make_namespaces=False_`) [source](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict.load_dict)

Import values from a dictionary structure. Nesting can be used to represent namespaces. `>>> ConfigDict().load_dict({'name': {'space': {'key': 'value'}}}) {'name.space.key': 'value'}`

**update**(`*a, **ka`) [source](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict.update)

*If the first parameter is a string, all keys are prefixed with this namespace. Apart from that it works just as the usual dict.update(). Example: `update('some.namespace', key='value')`

**meta_get**(`key, metafield, default=None`) [source](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict.meta_get)

Return the value of a meta field for a key.

**meta_set**(`_key_, _metafield_, _value_`) [source](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict.meta_set)

Set the meta field for a key to a new value. This triggers the on-change handler for existing keys. `meta_list`*(_key_)*[source]](http://bottlepy.org/docs/0.12/_modules/bottle.html#ConfigDict.meta_list)

Return an iterable of meta field names defined for a key.
