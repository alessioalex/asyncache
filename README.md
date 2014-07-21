# asyncache

Transparently cache your asynchronous get functions. [![Build Status](https://travis-ci.org/alessioalex/asyncache.svg?branch=master)](http://travis-ci.org/)

## Usage

#### asyncGetFunction = cache.remember(asyncGetFunction)
#### asyncDeleteFunction = cache.forget(asyncDeleteFunction)

### Example:

```js
var cache = require('asyncache')();
// implement cache methods
cache.set = function(key, value, ttl, cb) { /* ... */ };
cache.get = function(key, cb) { /* ... */ };
cache.del = function(key, cb) { /* ... */ };

// sample async function
var getUserDetails = function(userId, cb) {
  database.get(userId, function(err, user) {
    cb(err, user);
  });
};

getUserDetails = cache.remember(getUserDetails);

// this function will fetch the result from the db
getUserDetails(19384, function(err, user) {
  // now the result will be fetched from cache
  getUserDetails(19384, function(err, user) {
    // faster
  });
});
```

For more complete implementations checkout the `/examples` folder.
For more details read the source code, Luke.

## Note

Be aware that `cache.remember()` and `cache.forget()` are not atomic unless you implement that by yourself inside `cache.set()` and `cache.del()` (which are used internally be the previous two).
That means that unless you use some kind of lock you might end up with old data in your cache.

## Tests

```
npm test
```

## License

MIT
