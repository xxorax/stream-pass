var concat = require('concat-stream'),
  through = require('through'),
  util = require('util')

/**
 * @constructor
 * @param {function} cb The callback function called when all streams are closed (optionnal)
 * @param {array} streams array of stream names (optionnal)
 */
var streamPass = function (cb, streams) {
  this._results = {};
  this._streams = {};
  this._activeStreams = 0;

  if (!cb || typeof cb != 'function') {
    cb = function () {};
  }

  if (!streams) {
    streams = [];
  }

  if (!util.isArray(streams)) {
    throw new Error ('streams arg need to be array with stream names');
  }

  streams.forEach((function (name) {
    this.addStream(name);
  }).bind(this));

  this._cb = cb;
};

/**
 * @param {string} name The name of the stream to be add
 * @return {Stream} the through stream
 */
streamPass.prototype.addStream = function (name) {
  if (this._streams[name]) {
    throw new Error('stream '+name+' already exists');
  }
  this._streams[name] = through();
  this._activeStreams++;
  return this._streams[name];
};

/**
 * Get a declared stream or all the streams
 *
 * @param {string} name The name of the stream
 * @return {Stream|Array|undefined}
 */
streamPass.prototype.getStream = function(name) {
  if (!name) {
    return this._streams;
  }

  return this._streams[name];
};

/**
 * Add a result to a property in the final callback
 *
 * @param {string} property The name of the property
 * @param {*} result the data yo want to add
 */
streamPass.prototype.addToResult = function(property, result) {
  if (this._streams[property]) {
    throw new Error('stream '+property+' already exists, you cannot add a result with this property');
  }
  this._results[property] = result;
}

/**
 * Retrieve the results array
 *
 * @return {Array}  get all the results at this state
 */
streamPass.prototype.getResults = function () {
  return this._results;
}

/**
 * @param {streamPass} passStream a streamPass object
 * @param {object} opts options passed to the pipe (like {end: false})
 * @return streamPass
 */
streamPass.prototype.pipe = function (passStream, opts) {
  var streams = this.getStream();
  Object.keys(streams).forEach(function(name) {
    streams[name].pipe(
      passStream.getStream(name) || passStream.addStream(name),
      opts
    );
  });
  return passStream;
};

/**
 * Assign stream to the previously declared stream
 * It pipe it to the through stream and concat its contents to the result of the same name.
 * And finaly watch it to callback function when all the stream is finished.
 *
 * @param  {string} name   the name of the stream
 * @param  {Stream} stream a readable stream
 */
streamPass.prototype.passStream = function (name, stream) {
  if (!this._streams[name]) {
    throw new Error('stream name unknown');
  }

  if (this._cb) {
    stream.pipe(concat((function(result) {
      this._results[name] = result;
      if (!--this._activeStreams) this._cb(this._results);
    }).bind(this)));
  }

  stream.pipe(this._streams[name]);
};

/**
 * send end() to all the streams
 *
 * @return {streamPass} this
 */
streamPass.prototype.end = function () {
  var streams = this.getStream();
  Object.keys(streams).forEach(function(name) {
    streams[name].end();
  });
  return this;
}


module.exports = function (cb, streams) {
  return new streamPass(cb, streams);
};

module.exports.streamPass = streamPass;
