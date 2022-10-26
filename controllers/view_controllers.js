const conn = require('./dbConnection');
const auth_modules = require('../auth/auth_controllers');

require('dotenv').config();
//aws s3 imports
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

//aws dependency variables and declarations
const aws_bucket_name = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_BUCKET_ACCESS_KEY;
const secretAccessKey = process.env.AWS_BUCKET_SECRET_KEY;

//aws dependency variables and declarations
const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
});

const view_controllers = (app) =>{
    /* conn.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
       
        console.log('connected as id ' + conn.threadId);
      }); */
        const homeRoutes = ['/', '/home'];
        app.get(homeRoutes, auth_modules.isLoggedIn, async (req, res) =>{
            let sql = 'SELECT id, name, price, photo, slug FROM items';
            conn.query(sql, async (err, results) =>{
                if (err) throw err;
                else {
                    // console.log(results);
                    //aws s3 
                    for(const result of results){
                        const getObjectParams = {
                            Bucket: aws_bucket_name,
                            Key: result.photo
                        }
                        const command = new GetObjectCommand(getObjectParams);
                        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                        result.imageUrl = url;
                    }
                    res.render('home', {items: results, LoggedInUser: req.user[0]});
                }
            });
            
        });
        app.get('/itemdetails/:slug', auth_modules.isLoggedIn, async (req, res) =>{
            let sql = `SELECT * FROM items WHERE slug = "${req.params.slug}"`;
            conn.query(sql, async (err, result) =>{
                if (err) throw err;
                else {
                    //aws s3
                    for(const item of result){
                        const getObjectParams = {
                            Bucket: aws_bucket_name,
                            Key: item.photo
                        }
                        const command = new GetObjectCommand(getObjectParams);
                        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                        item.imageUrl = url;
                    }
                    
                    // console.log(result);
                    const checkCartSql = `SELECT * FROM cart WHERE itemId = '${result[0].id}' AND cartowner = '${req.user[0].id}'`;
                    conn.query(checkCartSql, async (err, cartResult) =>{
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
            conn.query(sql, async (err, results) =>{
                if (err) throw err;
                else {
                    // console.log(results);
                    var total_cost = 0;
                    for(var i = 0; i < results.length; i++){
                        total_cost += results[i].price;

                        //aws s3
                        const getObjectParams = {
                            Bucket: aws_bucket_name,
                            Key: results[i].photo
                        }
                        const command = new GetObjectCommand(getObjectParams);
                        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                        results[i].imageUrl = url;
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