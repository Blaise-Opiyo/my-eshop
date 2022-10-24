const mysql = require('mysql');

if(process.env.JAWSDB_URL){
  var conn = mysql.createConnection(process.env.JAWSDB_URL);
}else{
  var conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'eshop'
  });
}



  module.exports = conn;