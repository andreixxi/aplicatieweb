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
const fileupload = require('express-fileupload');
// const tf = require('@tensorflow/tfjs-node');// import nodejs bindings to native tensorflow, not required, but will speed up things drastically (python required)
const faceapi = require('@vladmandic/face-api');
const sharp = require('sharp');
const sizeOf = require('image-size');
const canvas = require('canvas');
const triangulate = require("delaunay-triangulate");
const PythonShell = require('python-shell').PythonShell;
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public/'));
app.use(fileupload());

// get user email if it exists
var email;
app.post('/', function async(req, res, next) {
    email = req.body.email;
    next(); // pass control to the next handler
});

//render index or admin page
app.all('/', function (req, res) {
    fs.readFile('items.json', function (err, data) {
        if (err) {
            res.status(500).end();
        } else {
            if (email == gmailAcc) { //admin
                res.render('admin.ejs', {
                    stripePublicKey: stripePublicKey,
                    items: JSON.parse(data)
                });
            } else {
                res.render('index.ejs', {
                    stripePublicKey: stripePublicKey,
                    items: JSON.parse(data)
                });
            }
        }
    });
});

//check if admin
app.post('/googlesignin', function (req, res) {
    var admin = false;
    if (req.body.email == gmailAcc) {
        admin = true;
    } else {
        admin = false;
    }
    res.json({ admin: admin });
});

//upload images to server
app.post('/saveImage', function (req, res) {
    console.log("Both images were uploaded, algorithm starting...");
    const files = [req.files.image1, req.files.image2]; // files from request
    const fileNames = [req.files.image1.name, req.files.image2.name];
    const paths = [__dirname + '/uploads/' + fileNames[0], __dirname + '/uploads/' + fileNames[1]];
    //upload images to folder
    for (var i = 0; i < 2; i++) {
        files[i].mv(paths[i], (err) => {
            if (err) {
                console.error(err);
                res.end(JSON.stringify({ status: 'error', message: err }));
                return;
            }
            res.end(JSON.stringify({ status: 'images were successfully saved to the server'}));
        });
    }
});

//resize + facial morphing
app.post('/processImg',async function (req, res) {
    const img1Name = req.files.image1.name;
    const img2Name = req.files.image2.name;
    const { outputImg1, outputImg2 } = await processImages(img1Name, img2Name);
    await facialDetection(outputImg1, outputImg2);
    setTimeout(function() {
        const image64 = base64_encode(`${__dirname}\\uploads\\MorphedFace.jpg`);
        removeDir(path.join(__dirname, 'uploads')); //clean folder
        res.send(image64)}, 5000); // wait 5s
});

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data and convert to base64 encoded string
    var base64 = 'data:image/jpeg;base64,'
    var image64 = fs.readFileSync(file, 'base64');
    return base64 + image64;
}

async function processImages(img1Name, img2Name) {
    let img1 = `uploads/${img1Name}`; //get images
    let img2 = `uploads/${img2Name}`;
    var imgs = [img1, img2];

    var name1 = img1Name.split('.')[0]; //get name w/o extension
    var name2 = img2Name.split('.')[0];

    var imgExt1 = img1Name.split('.')[1]; //get extensions
    var imgExt2 = img2Name.split('.')[1];

    outputImg1 = `uploads/${name1}_resized.${imgExt1}`;
    outputImg2 = `uploads/${name2}_resized.${imgExt2}`;
    var outputs = [outputImg1, outputImg2];

    var dimensions1 = sizeOf(img1); //first img size
    var w1 = dimensions1.width;
    var h1 = dimensions1.height

    var dimensions2 = sizeOf(img2); //2nd img size
    var w2 = dimensions2.width;
    var h2 = dimensions2.height;

    wmin = Math.min(w1, w2); // min width and height
    hmin = Math.min(h1, h2);

    //resize both images to min width/height
    for (var i = 0; i < 2; i++) {
        sharp(imgs[i]).resize({
            height: hmin,
            width: wmin,
            fit: 'contain' // contain - centreaza imaginea si in rest fundal negru; fill face un aspect urat
        }).toFile(outputs[i])
            .then(function () {
                console.log(`images were resized successfully`);
            })
            .catch(function () {
                console.log(`error while resizing images`);
            });
    }

    return { outputImg1, outputImg2 };
}

async function facialDetection(outputImg1, outputImg2) {
    //load  models
    const MODEL_URL = `${__dirname}/public/models/`;
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

    console.log('loaded models');

    var images = [outputImg1, outputImg2];
    var img1Coords = [], img2Coords = [];
    var imgCoords = [img1Coords, img2Coords];

    // 1. Find Point Correspondences using Facial Feature Detection
    for (var i = 0; i < 2; i++) {
        const img = await canvas.loadImage(__dirname + '\\' + images[i]);
        const cvs = canvas.createCanvas(img.width, img.height);
        const context = cvs.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        faceapi.env.monkeyPatch({ Canvas: canvas.Canvas, Image: canvas.Image, ImageData: canvas.ImageData });
        let fullFaceDescriptions = await faceapi.detectSingleFace(cvs).withFaceLandmarks();

        // write facial landmarks to .txt
        let file = fs.createWriteStream(images[i] + '.txt');
        file.on('error', function (error) {
            console.log('There has been an error while writing facial landmarks to file.');
        });
        for (var idx = 0; idx < fullFaceDescriptions.landmarks._positions.length; idx++) {
            file.write(fullFaceDescriptions.landmarks._positions[idx]._x + ' ' + fullFaceDescriptions.landmarks._positions[idx]._y + '\n');
            imgCoords[i].push({
                x: fullFaceDescriptions.landmarks._positions[idx]._x,
                y: fullFaceDescriptions.landmarks._positions[idx]._y
            }); //save to array to average them afterwards
        }
        console.log('Finished writing facial landmarks to .txt');
        file.end();
    } // end  Facial Feature Detection

    //calculate the average of corresponding points in the two sets and obtain a single set of points
    var alpha = 0.5;
    var avgCoords = [];
    var file = fs.createWriteStream('uploads/avg.txt');
    file.on('error', function (error) {
        console.log('There has been an error while writing avg pts to file.');
    });
    for (var i = 0; i < img1Coords.length; i++) {
        var x = (1 - alpha) * img1Coords[i].x + alpha * img2Coords[i].x;
        var y = (1 - alpha) * img1Coords[i].y + alpha * img2Coords[i].y;
        file.write(x + ' ' + y + '\n');
        avgCoords.push({
            x: x,
            y: y
        });
    } // end average
    console.log('Finished writing avg to .txt');
    file.end();

    // 2. Delaunay Triangulation
    //every 2 values represent a point (x, y) 
    var delaunayCoords = [];
    for (var i = 0; i < avgCoords.length; i++) {
        delaunayCoords[i] = [];
        delaunayCoords[i][0] = avgCoords[i].x;
        delaunayCoords[i][1] = avgCoords[i].y;
    }
    var triangles = triangulate(delaunayCoords); // get triangles from points

    // write triangles to file
    file = fs.createWriteStream(__dirname + '/uploads/tri.txt');
    file.on('error', function (error) {
        console.log('There has been an error while writing triangles to file.');
    });
    triangles.forEach(function (tr) {
        file.write(tr[0] + ' ' + tr[1] + ' ' + tr[2] + '\n');
    });
    console.log('Finished writing triangles to .txt');
    file.end();

    // 3. Warping images and alpha blending in py
    let options = {
        args: [
            `${outputImg1}`, //path to image 1
            `${outputImg2}`, //path to image 2
            `uploads\\avg.txt`, //path to avg coords
            `uploads\\tri.txt` //path to triangles
        ]
    };
    // run python script for face morph
    PythonShell.run('public/faceMorph.py', options, function (err, results) {
        if (err) throw err;
        console.log('finished running python script. morphing images done.');
    });
}

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
    output.on('end', function () {
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

const removeDir = function (path) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path)

        if (files.length > 0) {
            files.forEach(function (filename) {
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

//purchase functionality
app.post('/purchase', function (req, res) {
    fs.readFile('items.json', function (err, data) {
        if (err) {
            res.status(500).end();
        } else {
            var customerEmail = req.body.customer.email;
            var customerName = req.body.customer.name;
            const emailContent = `
                            <p>Hello ${customerName},</p>
                            <p>Thank you for your purchase. You can access your items here:</p>
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
                    // fileName: itemJson.imgName
                    fileName: itemJson.file
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
