// // https://learnopencv.com/face-morph-using-opencv-cpp-python/
// // 1. Find Point Correspondences using Facial Feature Detection (detect 68 corresponding points with dlib) and save the coordinates in a file 

// // 2. Delaunay Triangulation
// // https://github.com/mapbox/delaunator
// // From the previous step we have two sets of 68 points — one set per image. We can calculate the average of corresponding points in the two sets and obtain a single set of 68 points. On this set of average points we perform Delaunay Triangulation. The result of Delaunay triangulation is a list of triangles represented by the indices of points in the 68 points array. In this particular case the triangulation produces n triangles connecting the 68 points. The triangulation is stored as an array of three columns. 
// // Triangulation
// // 38 40 37 => points 38, 40 and 37 form a triangle 

// // 3. Warping images and alpha blending
// // check first link - opencv - for more info
// //     1.Find location of feature points in morphed image
// //     2.Calculate affine transforms 
// //     3.Warp triangles
// //     4.Alpha blend warped images


// $(function () {

//     function boundingRect(x1, y1, x2, y2, x3, y3) {
//         var r = {};
//         let x = Math.min(x1, x2, x3), y = Math.min(y1, y2, y3);
//         let w = Math.max(x1, x2, x3) - x + 1, h = Math.max(y1, y2, y3) - y + 1;
//         r.x = x, r.y = y, r.w = w, r.h = h;
//         return r;
//     }

//     function morphTriangle(image1, image2, imgMorph, t1, t2, t, alpha) {
//         // find bounding rectangle for each triangle
//         var r1, r2, r;
//         r1 =  boundingRect(t1[0].x, t1[0].y, t1[1].x, t1[1].y, t1[2].x, t1[2].y);
//         r2 = boundingRect(t2[0].x, t2[0].y, t2[1].x, t2[1].y, t2[2].x, t2[2].y);
//         r = boundingRect(t[0].x, t[0].y, t[1].x, t[1].y, t[2].x, t[2].y);
     
//         // Offset points by left top corner of the respective rectangles
//         var t1Rect = [], t2Rect = [], tRect = [];
//         for(var i = 0; i < 3; i++) {
//             tRect.push((t[i].x - r.x), (t[i].y - r.y));
//             t1Rect.push((t1[i].x - r1.x), (t1[i].y - r1.y));
//             t2Rect.push((t2[i].x - r2.x), (t2[i].y - r2.y));
//         }

//         var mask = [];
//         for (let i = 0; i < r.h; i++) {
//             mask[i] = [[], []];
//             for (let j = 0; j < r.w; j++) {
//                 mask[i][j] = [0, 0, 0];
//             }
//         }
        
//         const arr = [];
// for (let i = 0; i < 4; i++) {
//   arr[i] = [[], []];
//   for (let j = 0; j < 2; j++) {
//     arr[i][j] = [0, 0, 0];
//   }
// }

// console.log(arr);
// cv.fillConvexPoly(arr,
// 				[(21,  0, 21, 18, 0, 0)],
//         (1, 1, 1),
//         16,
//         0)
// console.log(arr)  

//         return;
//     } // end of function morphTriangle()

//     const MODEL_URL = '/models';

//     const facialFeatureDetection = async function (images) {
//         await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
//         await faceapi.loadFaceLandmarkModel(MODEL_URL);
//         await faceapi.loadFaceRecognitionModel(MODEL_URL);

//         // get images
//         var image1 = images[0];
//         var image2 = images[1];

//         // 1. Find Point Correspondences using Facial Feature Detection
//         let fullFaceDescriptions1 = await faceapi.detectSingleFace(image1).withFaceLandmarks();
//         let fullFaceDescriptions2 = await faceapi.detectSingleFace(image2).withFaceLandmarks();

//         //save face landmarks coordinates
//         var img1Coords = [];
//         var img2Coords = [];
//         for (var i = 0; i < fullFaceDescriptions1.landmarks._positions.length; i++) {
//             img1Coords.push({
//                 x: fullFaceDescriptions1.landmarks._positions[i]._x,
//                 y: fullFaceDescriptions1.landmarks._positions[i]._y
//             });
//             img2Coords.push({
//                 x: fullFaceDescriptions2.landmarks._positions[i]._x,
//                 y: fullFaceDescriptions2.landmarks._positions[i]._y
//             });
//         }

//         //calculate the average of corresponding points in the two sets and obtain a single set of points
//         var alpha = 0.5;
//         var avgCoords = [];
//         for (var i = 0; i < img1Coords.length; i++) {
//             var x = (1 - alpha) * img1Coords[i].x + alpha * img2Coords[i].x;
//             var y = (1 - alpha) * img1Coords[i].y + alpha * img2Coords[i].y;
//             avgCoords.push({
//                 x: x,
//                 y: y
//             });
//         }

//         // 2. Delaunay Triangulation
//         //every 2 values represent a point (x, y) 
//         var delaunayCoords = [];
//         for (var i = 0; i < avgCoords.length; i++) {
//             delaunayCoords.push(avgCoords[i].x, avgCoords[i].y);
//         }

//         // apply delaunay algorithm on the avg pts, each group of three numbers forms a triangle
//         const delaunayTriangles = new Delaunator(delaunayCoords);//Constructs a delaunay triangulation object given an array of point coordinates of the form: [x0, y0, x1, y1, ...]

//         // console.log(delaunayTriangles.triangles); //array of triangle vertex indices (each group of three numbers forms a triangle).
//         // console.log(delaunayTriangles.triangles.length); //336

//         var imgMorph = new Image();
//         // coordinates of all triangles
//         for (let i = 0; i < delaunayTriangles.triangles.length; i += 3) {
//             var x = delaunayTriangles.triangles[i];
//             var y = delaunayTriangles.triangles[i + 1];
//             var z = delaunayTriangles.triangles[i + 2];

//             var t1 = [(img1Coords[x]), (img1Coords[y]), (img1Coords[z])]; // x y z points from imgCoords form triangle t1
//             var t2 = [img2Coords[x], img2Coords[y], img2Coords[z]];
//             var t = [avgCoords[x], avgCoords[y], avgCoords[z]];

//             // morph one triangle at a time
//             morphTriangle(image1, image2, imgMorph, t1, t2, t, alpha);
//         }

//     } // end of facialFeatureDetection() function

// // var a = nj.array([2,3,4]);
//                 // console.log(a.selection.data);

//     $(".uploadbuttons").on("change", function (e) {
//         const tgt = e.target;
//         if (tgt.type !== "file") {
//             return;
//         }
//         if (!tgt.files || !tgt.files[0]) {
//             return;
//         }
//         const reader = new FileReader();
//         const idx = tgt.id.replace("picture", "");
//         var images = [];
//         reader.onload = function (e) {
//             const image = `<img src="${e.target.result}" style="width:400px;height:auto;" id="image${idx}-morph">`;
//             $("#appendimg" + idx).html(image);
//             if ($(".uploadbuttons").find("img").length === 2) {
//                 // console.log(($(".uploadbuttons").find("img"))[0].id);
//                 // console.log(($(".uploadbuttons").find("img"))[1]);
//                 images.push($(".uploadbuttons").find("img")[0]);
//                 images.push($(".uploadbuttons").find("img")[1]);
//                 console.log("Both images were uploaded, algorithm starting...");
                
//                 facialFeatureDetection(images);
//             }
//         };
//         reader.readAsDataURL(tgt.files[0]);
//     });
// });