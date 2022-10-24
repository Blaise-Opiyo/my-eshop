const multer = require('multer');
const conn = require('./dbConnection');
var bodyParser = require('body-parser');

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
      cb(null, 'assets/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
const upload = multer({ storage: storage })
var urlencodedParser = bodyParser.urlencoded({extended:false});


const server_controllers = (app) =>{
    app.post('/create-form', urlencodedParser, upload.single('image'), (req, res) =>{
        
        let slug_name =req.body.name.replace(/\s+/g, '-').toLowerCase();
        const itemDetails = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.descritption,
            photo: req.file.originalname,
            sellerId: req.user[0].id,
            slug: slug_name
        }
        const insertItemSql = `INSERT INTO items(name, price, description, photo, seller_id, slug) VALUES
        ("${itemDetails.name}", "${itemDetails.price}", "${itemDetails.description}", "${itemDetails.photo}", "${itemDetails.sellerId}", "${itemDetails.slug}")`;
        conn.query(insertItemSql, (err, results) =>{
            if (err) throw err;
            else {
                console.log(results);
                res.redirect('home');
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

      conn.query(deleteCartSql, (err, results) =>{
        if (err) throw err;
        else {
          conn.query(deleteItemSql, (err, results) =>{
            if (err) throw err;
            else {
                console.log(results);
                res.redirect('../home');
            }
        })
        }
    })
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
module.exports = server_controllers;