const express  = require('express');
var passport_config = require('./configurations/passport-config.js')
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const conn = require('./controllers/dbConnection');
const auth_modules = require('./auth/auth_controllers')
const view_controllers = require('./controllers/view_controllers');
const server_controllers = require('./controllers/server_controllers');

var flash = require('connect-flash');


const app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
app.use('/', express.static('views/', {index: "home"}));

app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat',
                                    resave: true,
                                    saveUninitialized: true
                                    }));
app.use(passport.initialize());


app.use(flash());
app.use(passport.session());

view_controllers(app);
server_controllers(app);
auth_modules.auth_controllers(app,passport);
passport_config(passport);

// const port = process.env.PORT || 3001;
const PORT = 3001;
app.listen(process.env.PORT || PORT, ()=>{
    console.log("Server running on port 3001");
});