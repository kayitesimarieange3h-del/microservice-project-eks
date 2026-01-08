// Membuat module AngularJS bernama 'catsvsdogs' tanpa dependency
var app = angular.module('catsvsdogs', []);

// Membuat koneksi ke server menggunakan Socket.IO
var socket = io.connect();

// Mengambil elemen HTML untuk background statistik A dan B
var bg1 = document.getElementById('background-stats-1');
var bg2 = document.getElementById('background-stats-2');

// Mendefinisikan controller 'statsCtrl'
app.controller('statsCtrl', function($scope){

  // Nilai awal persentase vote
  $scope.aPercent = 50;
  $scope.bPercent = 50;

  // Fungsi untuk menerima dan memperbarui skor dari server
  var updateScores = function(){

    // Mendengarkan event 'scores' dari Socket.IO
    socket.on('scores', function (json) {

       // Mengubah data JSON string menjadi object
       data = JSON.parse(json);

       // Mengambil nilai vote a dan b, default 0 jika kosong
       var a = parseInt(data.a || 0);
       var b = parseInt(data.b || 0);

       // Menghitung persentase vote
       var percentages = getPercentages(a, b);

       // Mengatur lebar elemen background sesuai persentase
       bg1.style.width = percentages.a + "%";
       bg2.style.width = percentages.b + "%";

       // Memperbarui data scope AngularJS
       $scope.$apply(function () {
         $scope.aPercent = percentages.a; // persentase A
         $scope.bPercent = percentages.b; // persentase B
         $scope.total = a + b;             // total vote
       });
    });
  };

  // Fungsi inisialisasi awal
  var init = function(){
    document.body.style.opacity = 1; // menampilkan halaman
    updateScores();                  // mulai mendengarkan skor
  };

  // Menjalankan init saat menerima pesan dari server
  socket.on('message', function(data){
    init();
  });
});

// Fungsi untuk menghitung persentase vote A dan B
function getPercentages(a, b) {
  var result = {};

  // Jika total vote lebih dari 0
  if (a + b > 0) {
    result.a = Math.round(a / (a + b) * 100); // persentase A
    result.b = 100 - result.a;                // persentase B
  } 
  // Jika belum ada vote
  else {
    result.a = result.b = 50; // default 50:50
  }

  // Mengembalikan hasil persentase
  return result;
}
