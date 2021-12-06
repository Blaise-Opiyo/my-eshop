const bcrypt = require('bcrypt');
const saltRounds = 10;
const conn = require('../controllers/dbConnection')
var LocalStrategy = require('passport-local').Strategy;

conn.connect();

module.exports = (passport) =>{


  //signup passport configuration
  passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            conn.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err){
                    return done(err);
                  }else{
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    const hashedPassword = bcrypt.hashSync(password, saltRounds);
                    var newUserMysql = {
                        username: username,
                        email: req.body.email,
                        password: hashedPassword// use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( username, email, password ) values (?,?,?)";
                    console.log(newUserMysql)
                    conn.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.password],function(err, rows) {
                      newUserMysql.id = rows.insertId;
                      return done(null, newUserMysql);
                    });

                }}
            });

        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            // conn.connect();
            conn.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err){
                    return done(err);
                  }else{
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }else{

                // if the user is found but the password is wrong
                
                if (!( bcrypt.compareSync(password, rows[0].password))){
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
              }else{
            // all is well, return successful user
            return done(null, rows[0]);

          }}}
		});
}))


passport.serializeUser(function(user, done) {

      done(null, user.id);

  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {

      conn.query("SELECT * FROM users WHERE id = ? ",[id], function(err, results){

          done(err, results);

      });
  });
}
