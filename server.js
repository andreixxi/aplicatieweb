if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const gmailAcc = process.env.gmailAcc
const gmailPass = process.env.gmailPass

const express = require('express');
const app = express();
const fs = require('fs'); //file system module allows you to work with the file system on your computer.
const stripe = require('stripe')(stripeSecretKey);
const nodemailer = require('nodemailer');
const archiver = require('archiver');
const path = require('path');

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

function createArchive(customerName, emailAttachment) {
    // create a file to stream archive data to.
    const output = fs.createWriteStream('archives/' + customerName + '.zip');
    const archive = archiver('zip');

    // listen for all archive data to be written'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
        console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.directory(emailAttachment[0].path); //append files from path and naming it fileName within the archive

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();

    return output;
}

function sendEmail(customerName, customerEmail, emailContent, emailAttachment) {
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

    const output = createArchive(customerName, emailAttachment);

    // send mail with defined transport object
    let info = transporter.sendMail({
        from: `"LA21IXX" <${gmailAcc}>`, // sender address
        to: customerEmail, // list of receivers
        subject: "LA21IXX ORDER", // Subject line
        html: emailContent, // html body
        attachments: output // the archive
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

const removeDir = function(path) {
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path)
  
      if (files.length > 0) {
        files.forEach(function(filename) {
          if (fs.statSync(path + "/" + filename).isDirectory()) {
            removeDir(path + "/" + filename)
          } else {
            fs.unlinkSync(path + "/" + filename)
          }
        })
      } else {
        console.log("No files found in the directory.")
      }
    } else {
      console.log("Directory path not found.")
    }
  }

app.post('/purchase', function (req, res) {
    fs.readFile('items.json', function (err, data) {
        if (err) {
            res.status(500).end();
        } else {
            var customerEmail = req.body.customer.email;
            var customerName = req.body.customer.name;
            var link = 'TODO'; // to do
            const emailContent = `
                            <p>Hello ${customerName},</p>
                            <p>Thank you for your purchase. You can access your items here:</p>
                            <p>${link}</p>
                            `;
            const emailAttachment = [];
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
                emailAttachment.push({
                    path: itemJson.path,
                    fileName: itemJson.imgName
                });
            }); // end forEach

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(function () {
                //success
                console.log('charge succesful');

                //send email to customer
                sendEmail(customerName, customerEmail, emailContent, emailAttachment);

                //delete the archives
                removeDir(path.join(__dirname, 'archives'));
                
                res.json({
                    message: 'Successfully purchased items. You will soon get your items via email.'
                });
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