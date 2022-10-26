const multer = require('multer');
const conn = require('./dbConnection');
var bodyParser = require('body-parser');
//aws imports
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();
const crypto = require('crypto');

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
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

// const storage = multer.diskStorage({
//     destination: (req, file, cb) =>{
//       cb(null, 'assets/uploads');
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
// })
const storage = multer.memoryStorage();

const upload = multer({ storage: storage })
var urlencodedParser = bodyParser.urlencoded({extended:false});


const server_controllers = (app) =>{
    app.post('/create-form', urlencodedParser, upload.single('image'), (req, res) =>{
        //aws upload variables and dependencies
        const imageName = generateFileName();
        const uploadParams = {
          Bucket: aws_bucket_name,
          Body: req.file.buffer,
          Key: imageName,
          ContentType: req.file.mimetype
        }
        
        let slug_name =req.body.name.replace(/\s+/g, '-').toLowerCase();
        const itemDetails = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.descritption,
            photo: imageName,
            sellerId: req.user[0].id,
            slug: slug_name
        }
        // Send the upload to S3
        s3Client.send(new PutObjectCommand(uploadParams));

        const insertItemSql = `INSERT INTO items(name, price, description, photo, seller_id, slug) VALUES
        ("${itemDetails.name}", "${itemDetails.price}", "${itemDetails.description}", "${itemDetails.photo}", "${itemDetails.sellerId}", "${itemDetails.slug}")`;
        conn.query(insertItemSql, (err, results) =>{
            if (err) throw err;
            else {
                console.log(results);
                res.redirect('/');
            }
        });
    });
    app.post('/add-to-cart', urlencodedParser, (req, res) =>{
      const cartItem = {
        itemId: req.body.itemId,
        itemName: req.body.itemName,
        itemPrice: req.body.itemPrice,
        itemPhoto: req.body.itemPhoto,
        cartOwner: req.user[0].id
      }
      const cartInsertSql = `INSERT INTO cart(name, price, photo, cartowner, itemId) VALUES
      ('${cartItem.itemName}','${cartItem.itemPrice}','${cartItem.itemPhoto}','${cartItem.cartOwner}', ${cartItem.itemId}) `;
      conn.query(cartInsertSql, (err, results) =>{
        if (err) throw err;
        else {
            console.log(results);
            res.redirect('cart');
        }
    });
    });
    app.post('/delete-item/:itemId', (req, res) =>{
      const deleteItemSql = `DELETE FROM items WHERE id = '${req.params.itemId}'`;
      const deleteCartSql = `DELETE FROM cart WHERE itemId = '${req.params.itemId}'`;
      const getItemPhotoName = `SELECT Photo FROM items WHERE id = '${req.params.itemId}'`;

      conn.query(getItemPhotoName, (err, result) =>{
        if(err) throw err;
        else{
          const photoName = result[0].Photo;
          conn.query(deleteCartSql, (err, results) =>{
            if (err) throw err;
            else {
              conn.query(deleteItemSql, async (err, results) =>{
                if (err) throw err;
                else {
                    console.log(results);
    
                    //aws s3
                    const deleteParams = {
                      Bucket: aws_bucket_name,
                      Key: photoName
                    }
                    const command = new DeleteObjectCommand(deleteParams);
                    await s3Client.send(command);
    
                    res.redirect('/home');
                }
            })
            }
        })
        }

      });
    });
    app.post('/delete-cart-item', urlencodedParser, (req, res) =>{
      const deleteCartSql = `DELETE FROM cart WHERE itemId = '${req.body.itemId}' AND cartowner = '${req.user[0].id}'`;

      conn.query(deleteCartSql, (err, results) =>{
        if (err) throw err;
        else {
          console.log(results);
          res.redirect('home');
        }
    });
    });
    app.post('/make-order', (req, res) =>{
      const deleteCartSql = `DELETE FROM cart WHERE cartowner = '${req.user[0].id}'`;
      conn.query(deleteCartSql, (err, results) =>{
        if(err) throw err;
        else{
          res.redirect('success');
        }
      })
    });
}
module.exports.server_controllers = server_controllers;
module.exports.s3Client = s3Client;