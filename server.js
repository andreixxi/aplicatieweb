if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const emailInit = process.env.EMAIL_JS_INIT
const gmailAcc = process.env.gmailAcc
const gmailPass = process.env.gmailPass

const express = require('express');
const app = express();
const fs = require('fs'); //file system module allows you to work with the file system on your computer.
const stripe = require('stripe')(stripeSecretKey);
const nodemailer = require("nodemailer");
// const bodyParser = require('body-parser');
// const exphbs = require('express-handlebars');

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public/'));

// show items in shop from the backend
app.get('/', function (req, res) {
    fs.readFile('items.json', function (err, data) {
        if (err) {
            res.status(500).end();
        } else {
            res.render('index.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            });
        }
    });
});


app.post('/purchase', function (req, res) {
    console.log('body', req.body);

    fs.readFile('items.json', function (err, data) {
        if (err) {
            res.status(500).end();
        } else {
            var customerEmail = req.body.customer.email;
            var customerName = req.body.customer.name;
            var link = 'TODO'; // to do
            const emailContent = `
                            <p>Hello ${customerName},</p>
                            <p>Thank you for your purchase. You can access your items at the following link:</p>
                            <p>${link}</p>
                            `;

            const itemsJson = JSON.parse(data);
            const itemsArray = itemsJson.images; //.concat(itemsJson.something)
            let total = 0;
            req.body.items.forEach(function (item) {
                // item from the req
                const itemJson = itemsArray.find(function (i) {
                    // i -> each item in the itemsArray
                    return i.id == item.id;
                });
                total += itemJson.price * item.quantity;
            }); // end forEach

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(function () {
                //success
                console.log('charge succesful');
               // res.render('downloadpage.ejs');
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    host: "localhost", // TO CHANGE IF I DEPLOY IT 
                    port: 587, // 465 for web(SSL)
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: gmailAcc,
                        pass: gmailPass,
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                // send mail with defined transport object
                let info = transporter.sendMail({
                    from: `"LA21IXX" <${gmailAcc}>`, // sender address
                    to: customerEmail, // list of receivers
                    subject: "LA21IXX ORDER", // Subject line
                    text: "Hello", // plain text body
                    html: emailContent, // html body
                });
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
               
                res.json({
                    message: 'Successfully purchased items. You will soon get your items via email.'
                });

                //SEND DATA OR SHOW DOWNLOAD BUTTON ON A PROTECTED PAGE....
            }).catch(function () {
                console.log('charge fail');
                res.status(500).end();
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});