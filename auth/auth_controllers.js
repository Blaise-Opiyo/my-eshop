const conn = require('../controllers/dbConnection');
var bodyParser = require('body-parser');


var urlencodedParser = bodyParser.urlencoded({extended:false});

const auth_controllers = (app, passport) =>{
    app.get('/signup',(req,res) =>{
        res.render('signup',{ message: req.flash('signupMessage') });
      });
      app.post('/signup',urlencodedParser,
    
      
      passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        })
    
    );

    app.get('/login',(req,res) =>{
        res.render('login',{ message: req.flash('loginMessage') });
      });
      app.post('/login',urlencodedParser,
    
      passport.authenticate('local-login', {
                successRedirect : '/', // redirect to the secure profile section
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true, // allow flash messages
                session: true
        }),
    
    );
    app.post('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});
}
const isLoggedIn = (req, res, next) =>{

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
module.exports = {
    auth_controllers: auth_controllers,
    isLoggedIn: isLoggedIn
}