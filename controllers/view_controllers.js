const conn = require('./dbConnection');
const auth_modules = require('../auth/auth_controllers');

const view_controllers = (app) =>{
    /* conn.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
       
        console.log('connected as id ' + conn.threadId);
      }); */
        app.get('/', auth_modules.isLoggedIn, (req, res) =>{
            let sql = 'SELECT id, name, price, photo, slug FROM items';
            conn.query(sql, (err, results) =>{
                if (err) throw err;
                else {
                    // console.log(results);
                    res.render('home', {items: results, LoggedInUser: req.user[0]});
                }
            });
            
        });
        app.get('/itemdetails/:slug', auth_modules.isLoggedIn, (req, res) =>{
            let sql = `SELECT * FROM items WHERE slug = "${req.params.slug}"`;
            conn.query(sql, (err, result) =>{
                if (err) throw err;
                else {
                    // console.log(result);
                    const checkCartSql = `SELECT * FROM cart WHERE itemId = '${result[0].id}' AND cartowner = '${req.user[0].id}'`;
                    conn.query(checkCartSql, (err, cartResult) =>{
                        if(err) throw err;
                        else{
                            res.render('itemdetails', {item: result[0], LoggedInUser: req.user[0], cartResult: cartResult});
                        }
                    });
                    
                }
            });
        });
        app.get('/cart', auth_modules.isLoggedIn, (req, res) =>{
            let sql = `SELECT * FROM cart WHERE cartowner = '${req.user[0].id}'`;
            conn.query(sql, (err, results) =>{
                if (err) throw err;
                else {
                    // console.log(results);
                    var total_cost = 0;
                    for(var i = 0; i < results.length; i++){
                        total_cost += results[i].price;
                    }
                    // console.log(total_cost);
                    res.render('cart', {cart_Items: results, total_cost: total_cost, LoggedInUser: req.user[0]});;
                }
            });
        });
        app.get('/success', auth_modules.isLoggedIn, (req, res) =>{
            res.render('success', {LoggedInUser: req.user[0]});
        });
}
module.exports = view_controllers;