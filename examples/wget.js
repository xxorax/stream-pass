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
