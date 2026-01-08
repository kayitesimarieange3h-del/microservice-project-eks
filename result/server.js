// Mengimpor framework Express untuk membuat web server
var express = require('express'),

    // Mengimpor library async untuk menangani proses asynchronous (retry, parallel, dll)
    async = require('async'),

    // Mengimpor Pool dari pg untuk koneksi PostgreSQL
    { Pool } = require('pg'),

    // Mengimpor cookie-parser untuk membaca cookie dari request
    cookieParser = require('cookie-parser'),

    // Membuat aplikasi Express
    app = express(),

    // Membuat HTTP server dari Express
    server = require('http').Server(app),

    // Menghubungkan Socket.IO ke server HTTP
    io = require('socket.io')(server);

// Menentukan port aplikasi (dari environment atau default 4000)
var port = process.env.PORT || 4000;

// Event saat client Socket.IO berhasil terhubung
io.on('connection', function (socket) {

  // Mengirim pesan sambutan ke client yang baru terkoneksi
  socket.emit('message', { text : 'Welcome!' });

  // Event ketika client ingin subscribe ke suatu channel
  socket.on('subscribe', function (data) {
    socket.join(data.channel); // client masuk ke room/channel tertentu
  });
});

// Membuat pool koneksi ke database PostgreSQL
var pool = new Pool({
  connectionString: 'postgres://postgres:postgres@db/postgres'
});

// Mencoba koneksi ke database berulang kali (retry)
async.retry(
  { times: 1000, interval: 1000 }, // maksimal 1000x, jeda 1 detik
  function(callback) {

    // Mencoba menghubungkan ke database
    pool.connect(function(err, client, done) {
      if (err) {
        console.error("Waiting for db"); // database belum siap
      }
      callback(err, client);
    });
  },
  function(err, client) {
    if (err) {
      return console.error("Giving up"); // gagal setelah banyak percobaan
    }
    console.log("Connected to db"); // berhasil konek
    getVotes(client);               // mulai ambil data vote
  }
);

// Fungsi untuk mengambil data vote dari database
function getVotes(client) {

  // Query menghitung jumlah vote berdasarkan jenis vote
  client.query(
    'SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote',
    [],
    function(err, result) {

      if (err) {
        console.error("Error performing query: " + err);
      } else {

        // Mengolah hasil query menjadi format objek
        var votes = collectVotesFromResult(result);

        // Mengirim skor ke semua client secara real-time
        io.sockets.emit("scores", JSON.stringify(votes));
      }

      // Memanggil ulang fungsi ini setiap 1 detik
      setTimeout(function() {
        getVotes(client);
      }, 1000);
    }
  );
}

// Fungsi untuk mengubah hasil query menjadi objek vote
function collectVotesFromResult(result) {

  // Nilai default vote
  var votes = { a: 0, b: 0 };

  // Mengisi data vote dari hasil query
  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  // Mengembalikan hasil vote
  return votes;
}

// Middleware untuk membaca cookie dari request
app.use(cookieParser());

// Middleware untuk membaca data form (x-www-form-urlencoded)
app.use(express.urlencoded());

// Middleware untuk menyajikan file statis (HTML, CSS, JS)
app.use(express.static(__dirname + '/views'));

// Route utama aplikasi
app.get('/', function (req, res) {

  // Mengirim file index.html ke browser
  res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

// Menjalankan server pada port yang ditentukan
server.listen(port, function () {
  var port = server.address().port;
  console.log('App running on port ' + port);
});
