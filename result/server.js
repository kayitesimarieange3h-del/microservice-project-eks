var express = require('express'),
    async = require('async'),
    { Pool } = require('pg'),
    cookieParser = require('cookie-parser'),
    path = require('path'), // <--- FIX: Added missing import
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

// Setup Winston Logger (JSON format)
const winston = require('winston');
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

var port = process.env.PORT || 4000;

io.on('connection', function (socket) {
  socket.emit('message', { text : 'Welcome!' });

  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

// Use Environment Variable for DB connection (Senior SRE Best Practice)
var connectionString = process.env.POSTGRES_CONNECTION_STRING || 'postgres://postgres:postgres@db/postgres';

var pool = new Pool({
  connectionString: connectionString
});

async.retry(
  {times: 1000, interval: 1000},
  function(callback) {
    pool.connect(function(err, client, done) {
      if (err) {
        // FIX: Use logger instead of console.error
        logger.error("Waiting for db", { error: err.message });
      }
      callback(err, client);
    });
  },
  function(err, client) {
    if (err) {
      // FIX: Use logger
      return logger.error("Giving up", { error: err.message });
    }
    // FIX: Removed undefined 'retryCount' variable
    logger.info("Connected to database", { service: "result-app" });
    getVotes(client);
  }
);

function getVotes(client) {
  client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function(err, result) {
    if (err) {
      // FIX: Use logger
      logger.error("Error performing query", { error: err.message });
    } else {
      var votes = collectVotesFromResult(result);
      io.sockets.emit("scores", JSON.stringify(votes));
    }

    setTimeout(function() { getVotes(client) }, 1000);
  });
}

function collectVotesFromResult(result) {
  var votes = {a: 0, b: 0};

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

app.use(cookieParser());
// FIX: Added extended option to silence deprecation warning
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

server.listen(port, function () {
  var port = server.address().port;
  // FIX: Use logger
  logger.info('App running', { port: port });
});