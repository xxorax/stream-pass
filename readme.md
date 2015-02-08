# stream-pass

Manable multiple streams and their ends easily.

It uses [through](https://github.com/dominictarr/through) and [concat-stream](https://github.com/maxogden/concat-stream) to pipe and produce results to callback.

## Examples

Using child_process.spawn :
```js
var streamPass = require('stream-pass'), child_process = require('child_process');

var pass = streamPass(function(results) {
  console.log('stdout was: '+results.stdout.toString());
  console.log('2nd line of stderr was: '+results.stderr.toString().split(/\n/)[1]);
}, ['stderr', 'stdout']);

var child = child_process.spawn('wget', ['-O', '-', 'http://httpbin.org/user-agent']);

pass.passStream('stdout', child.stdout);
pass.passStream('stderr', child.stderr);

// stdout was: {
//   "user-agent": "Wget/1.15 (linux-gnu)"
// }
//
// 2nd line of stderr was: Resolving httpbin.org (httpbin.org)... 54.175.219.8
```

You can also pipe the streams :
```js
var streamPass = require('stream-pass');
var pass = streamPass(function(results) { ... }, ['myStream']);
pass.passStream('myStream', myStreamObject);
pass.getStream('myStream').pipe(process.stdout);
```

Or add some :
```js
var streamPass = require('stream-pass');
var pass = streamPass(function(results) { /* do something with results.myStream */ });
pass.addStream('myStream');
pass.passStream('myStream', myStreamObject);
```

## To do
- anyStream.pipe(pass.getStream('myStream')) brokes the callback
- passStream() without addStream() before
