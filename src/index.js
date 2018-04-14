import createError from 'http-errors';
import http from 'http';
import express from 'express';
import logger from 'morgan';
import OrderMatcher from './lib/ordermatcher';
import util from 'util';

var app = express();
var port = process.env.PORT || '3000';
app.set('port', port);

var server = http.createServer(app);

var pairRegistry = (function() {
  var registry = {};
  return {
    getMatcher: function(contract) {
      var matcher = registry[contract];
      if (!matcher) {
        registry[contract] = matcher = new OrderMatcher();
      }
      return matcher;
    }
  };
})();

app.use(logger('dev'));
app.use(express.json());

app.get('/orders/:pair', function(req, res) {
  var ordermatcher = pairRegistry.getMatcher(req.params.pair);
  res.json({pair: req.params.pair, info: ordermatcher.getOrderStats()});
});

app.post('/orders', function(req, res) {
  var ordermatcher = pairRegistry.getMatcher(req.body.pair);
  var order = ordermatcher.submitOrder(req.body);
  res.json(order);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json(err.message);
});


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}