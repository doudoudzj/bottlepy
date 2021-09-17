# Configuration (DRAFT)

Warning

This is a draft for a new API. [Tell us](mailto:bottlepy@googlegroups.com) what you think.

Bottle applications can store their configuration in [`Bottle.config`](http://bottlepy.org/docs/dev/api.html#bottle.Bottle.config), a dict-like object and central place for application specific settings. This dictionary controls many aspects of the framework, tells (newer) plugins what to do, and can be used to store your own configuration as well.

## CONFIGURATION BASICS

The [`Bottle.config`](http://bottlepy.org/docs/dev/api.html#bottle.Bottle.config) object behaves a lot like an ordinary dictionary. All the common dict methods work as expected. Let us start with some examples:

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

## NAMING CONVENTION

To make life easier, plugins and applications should follow some simple rules when it comes to config parameter names:

- All keys should be lowercase strings and follow the rules for python identifiers (no special characters but the underscore).
- Namespaces are separated by dots (e.g. `namespace.field` or `namespace.subnamespace.field`).
- Bottle uses the root namespace for its own configuration. Plugins should store all their variables in their own namespace (e.g. `sqlite.db` or `werkzeug.use_debugger`).
- Your own application should use a separate namespace (e.g. `myapp.*`).

## LOADING CONFIGURATION FROM A FILE

Configuration files are useful if you want to enable non-programmers to configure your application, or just don’t want to hack python module files just to change the database port. A very common syntax for configuration files is shown here:

```ini
[sqlite]
db = /tmp/test.db
commit = auto

[myapp]
admin_user = defnull
```

With [`ConfigDict.load_config()`](http://bottlepy.org/docs/dev/configuration.html#bottle.ConfigDict.load_config) you can load these `*.ini` style configuration files from disk and import their values into your existing configuration:

```
app.config.load_config('/etc/myapp.conf')
```

## LOADING CONFIGURATION FROM A PYTHON MODULE

Loading configuration from a Python module is a common pattern for Python programs and frameworks. Bottle assumes that configuration keys are all upper case:

You can load the this Python module with [:met:`ConfigDict.load_module`](http://bottlepy.org/docs/dev/configuration.html#id1):

```shell
>>> c = ConfigDict()
>>> c.load_module('config')
{DEBUG: True, 'SQLITE.DB': 'memory'}
>>> c.load_module("config", False)
{'DEBUG': True, 'SQLITE': {'DB': 'memory'}}
```

Note the second parameter to disable loading as namespaced items as in [`ConfigDict.load_dict()`](http://bottlepy.org/docs/dev/configuration.html#bottle.ConfigDict.load_dict). By default, loading from a Python module will call this method, unless you specifically call this method with False as the second argument.

## LOADING CONFIGURATION FROM A NESTED [`DICT`](https://docs.python.org/3/library/stdtypes.html#dict)

Another useful method is [`ConfigDict.load_dict()`](http://bottlepy.org/docs/dev/configuration.html#bottle.ConfigDict.load_dict). This method takes an entire structure of nested dictionaries and turns it into a flat list of keys and values with namespaced keys:

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

## LISTENING TO CONFIGURATION CHANGES

The `config` hook on the application object is triggered each time a value in [`Bottle.config`](http://bottlepy.org/docs/dev/api.html#bottle.Bottle.config) is changed. This hook can be used to react on configuration changes at runtime, for example reconnect to a new database, change the debug settings on a background service or resize worker thread pools. The hook callback receives two arguments (key, new_value) and is called before the value is actually changed in the dictionary. Raising an exception from a hook callback cancels the change and the old value is preserved.

```python
@app.hook('config')
def on_config_change(key, value):
  if key == 'debug':
      switch_own_debug_mode_to(value)
```

The hook callbacks cannot *change* the value that is to be stored to the dictionary. That is what filters are for.

## FILTERS AND OTHER META DATA

[`ConfigDict`](http://bottlepy.org/docs/dev/configuration.html#bottle.ConfigDict) allows you to store meta data along with configuration keys. Two meta fields are currently defined:

- help

  A help or description string. May be used by debugging, introspection or admin tools to help the site maintainer configuring their application.

- filter

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

## API DOCUMENTATION

*class* `ConfigDict`[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict)

A dict-like configuration storage with additional support for namespaces, validators, meta-data, overlays and more.

This dict-like class is heavily optimized for read access. All read-only methods as well as item access should be as fast as the built-in dict.

- `load_module`(*path*, *squash=True*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.load_module)

  Load values from a Python module.Example modue `config.py`:`DEBUG = True SQLITE = {    "db": ":memory:" } ``>>> c = ConfigDict() >>> c.load_module('config') {DEBUG: True, 'SQLITE.DB': 'memory'} >>> c.load_module("config", False) {'DEBUG': True, 'SQLITE': {'DB': 'memory'}} `Parameters:**squash** – If true (default), dictionary values are assumed to represent namespaces (see [`load_dict()`](http://bottlepy.org/docs/dev/configuration.html#bottle.ConfigDict.load_dict)).

- `load_config`(*filename*, ***options*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.load_config)

  Load values from an `*.ini` style config file.A configuration file consists of sections, each led by a `[section]` header, followed by key/value entries separated by either `=` or `:`. Section names and keys are case-insensitive. Leading and trailing whitespace is removed from keys and values. Values can be omitted, in which case the key/value delimiter may also be left out. Values can also span multiple lines, as long as they are indented deeper than the first line of the value. Commands are prefixed by `#` or `;` and may only appear on their own on an otherwise empty line.Both section and key names may contain dots (`.`) as namespace separators. The actual configuration parameter name is constructed by joining section name and key name together and converting to lower case.The special sections `bottle` and `ROOT` refer to the root namespace and the `DEFAULT` section defines default values for all other sections.With Python 3, extended string interpolation is enabled.Parameters:**filename** – The path of a config file, or a list of paths.**options** – All keyword parameters are passed to the underlying [`configparser.ConfigParser`](https://docs.python.org/3/library/configparser.html#configparser.ConfigParser) constructor call.

- `load_dict`(*source*, *namespace=''*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.load_dict)

  Load values from a dictionary structure. Nesting can be used to represent namespaces.`>>> c = ConfigDict() >>> c.load_dict({'some': {'namespace': {'key': 'value'} } }) {'some.namespace.key': 'value'} `

- `update`(**a*, ***ka*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.update)

  If the first parameter is a string, all keys are prefixed with this namespace. Apart from that it works just as the usual dict.update().`>>> c = ConfigDict() >>> c.update('some.namespace', key='value') `

- `meta_get`(*key*, *metafield*, *default=None*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.meta_get)

  Return the value of a meta field for a key.

- `meta_set`(*key*, *metafield*, *value*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.meta_set)

  Set the meta field for a key to a new value.

- `meta_list`(*key*)[[source\]](http://bottlepy.org/docs/dev/_modules/bottle.html#ConfigDict.meta_list)

  Return an iterable of meta field names defined for a key.

