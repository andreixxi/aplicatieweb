$(function () {
    var imagesRef = storage.ref();
    var videosRef = storage.ref();
    var shopRef = storage.ref();
    var worksRef = storage.ref();
    
    const tables = $('.getdata table');
    const saveBtn = $('.getdata #savebtn');
    const backBtn = $('.getdata #backbtn');
    const addBtn = $('.getdata #addbtn'); //images button
    const addBtn2 = $('.getdata #addbtn2');// video button
    const addBtn3 = $('.getdata #addbtn3');// shop button
    const addBtn4 = $('.getdata #addbtn4');// future works button

    tables.hide();
    backBtn.hide();
    saveBtn.hide();
    $('#table-wrapper').hide()

    backBtn.on('click', function () {
        $('#admin-section h1').show(500);
        $('#admin-section .row').show(500);
        tables.hide(500);
        backBtn.hide(500);
        saveBtn.hide(500);
        addBtn.hide(500);
        addBtn2.hide(500);
        addBtn3.hide(500);
        addBtn4.hide(500);
        $('#table-wrapper').hide(500);
    });

    //////////////////////// IMAGE GALLERY ////////////////////////////////
    const imgsTable = $('#imagesTable');
    var deletedImagesIds = [], addedImages = [];
    addBtn.hide();
    // update image gallery
    $('.updategallery').on('click', function () {
        $('#admin-section h1').hide(500);
        $('#admin-section .row').hide(500);
        backBtn.show(500);
        addBtn.show(500);
        saveBtn.show(500);
        $('#table-wrapper').show(500)
        imgsTable.show(500);
        addBtn.on('click', addImg);
        saveBtn[0].addEventListener('click', saveChanges);

        $("td").on('click', function () {
            var th = $(this).closest('table').find('th').eq($(this).index());
            var columnName = (th[0].innerText);
            if (columnName == 'Title' || columnName == 'Description') { //edit only title or description
                if ($(this).attr("contentEditable") == true) {
                    $(this).attr("contentEditable", "false");
                } else {
                    $(this).attr("contentEditable", "true");
                }
            }
        });

        $('.bi-trash').on('click', function () {
            var tableRow = $(this).closest("td").parent().text();
            var tableRowContent = tableRow.match(/\b(\w+)\b/g);
            // console.log(tableRowContent)
            var id = tableRowContent[0];
            deletedImagesIds.push(id);
            tableRow = $(this).closest("td").parent();
            tableRow.remove();
        });

        function addImg() {
            // get table data
            var tableRows = imgsTable[0].rows;
            var id = 0;
            for (var i = 0; i < tableRows.length - 1; i++) { //-1 for the thead
                var objCells = tableRows.item(i + 1).cells;
                let idRow = objCells[0].textContent;
                if (idRow > id) {
                    id = idRow;
                }
            }
            id++;

            console.log('first id', id)
            var glightboxform = GLightbox({
                selector: '.glightboxform',
                closeOnOutsideClick: false,
                draggable: false
            });
            glightboxform;

            glightboxform.on('slide_after_load', (data) => {
                const { slideIndex, slideNode, slideConfig, player, trigger } = data;

                //close form
                var cancelbtn = slideNode.querySelector('.cancel');
                cancelbtn.addEventListener('click', function () {
                    glightboxform.close();
                });

                //attach image to form
                var uploadbtn = slideNode.querySelector('#imgupload');
                var image, file, iconImg;
                uploadbtn.addEventListener('change', function (e) {
                    var imgdiv = slideNode.querySelector('#uploadedimg');
                    imgdiv.innerHTML = '';
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        file = tgt.files[0];
                        image = `<img src="${e.target.result}" style="width:100px;height:auto;">`;
                        iconImg = e.target.result;
                        imgdiv.innerHTML = image; //append under the input
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                //add data to table and close form
                var addbtn = slideNode.querySelector('.add');
                addbtn.addEventListener('click', function () {
                    var title = slideNode.querySelector('#imgtitle').value;
                    var description = slideNode.querySelector('#imgdesc').value;
                    var path = image;
                    if (title !== undefined && description !== undefined && path !== undefined) {
                        var row = imgsTable[0].insertRow(imgsTable[0].length);
                        var j = 0;
                        var cell0 = row.insertCell(j++); //id hidden
                        var cell1 = row.insertCell(j++); //icon
                        var cell2 = row.insertCell(j++); //title
                        var cell3 = row.insertCell(j++); //desc 
                        var cell4 = row.insertCell(j++); //trash icon

                        cell0.innerText = id;
                        cell0.style.display = 'none';

                        var img = document.createElement('img');
                        img.setAttribute('src', iconImg);
                        img.setAttribute('height', '25px');
                        img.setAttribute('width', 'auto');
                        cell1.appendChild(img);

                        cell2.innerHTML = title;
                        cell3.innerHTML = description;
                        cell4.innerHTML = '<i class="bi bi-trash"></i>';

                        addedImages.push({
                            id: id,
                            title: title,
                            desc: description,
                            href: '-',
                            file: file
                        });

                        id++;
                        glightboxform.close(); //close form
                    }
                });
            });
        } //end addImg() function

        async function saveChanges() {
            console.log(addedImages.length, 'imagini de salvat')
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: `Save`,
                denyButtonText: `Don't save`,
            }).then(function (result) {
                if (result.isConfirmed) {
                    console.log('saving changes for images...')

                    //DELETE FROM DB
                    deletedImagesIds.forEach(function (id) {
                        db.collection("imageGallery").get().then((querySnapshot) => {
                            querySnapshot.forEach(function (doc) {
                                if (doc.data().id == id) {
                                    //delete from storage
                                    // var imgRef = imagesRef.child(`imageGallery/${doc.data().name}`);
                                    // imgRef.delete()
                                    //     .then(console.log('image was deleted from firebase storage'))
                                    //     .catch(console.log('there has been an error while deleting img from fb storage'))

                                    // delete image from DB
                                    db.collection("imageGallery").doc(doc.id).delete().then(() => {
                                        console.log("Document successfully deleted!", doc.id, doc.data().id);
                                    }).catch((error) => {
                                        console.error("Error deleting document: ", error);
                                    });
                                }
                            });
                        })
                    });

                    console.log('deleted images', deletedImagesIds)


                    //ADD
                    addedImages.forEach(function (img) {
                        var imgRef = imagesRef.child(`imageGallery/${img.file.name}`);
                        imgRef.put(img.file).then(function (snapshot) {
                            console.log('Uploaded an image to firebase storage!');
                            imgRef.getDownloadURL().then(function (url) {
                                img.href = url;
                                //add to firebase DB
                                db.collection("imageGallery").add({
                                    name: img.file.name,
                                    id: img.id,
                                    title: img.title,
                                    desc: img.desc,
                                    href: img.href,
                                    pattern: `pattern${img.id}`
                                })
                                    .then((docRef) => {
                                        console.log("Added new image to DB. Document written with ID: ", docRef.id);
                                        addedImages.splice(0, 1);//remove first element
                                    })
                                    .catch((error) => {
                                        console.error("Error adding document: ", error);
                                    });
                            });
                        });
                    });

                    // get table data; update for title or description
                    var tableRows = imgsTable[0].rows;
                    var tableRowsArray = Object.values(tableRows);
                    tableRowsArray.splice(0, 1); //remove header

                    tableRowsArray.forEach(function (tr) {
                        var objCells = tr.cells;
                        var id = objCells[0].innerText;
                        var title = objCells[2].innerHTML;
                        var desc = objCells[3].innerHTML;

                        console.log(tr)
                        //UPDATE FOR TITLE/ DESC 
                        db.collection("imageGallery").get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                if (doc.data().id == id) {
                                    // update image title and desc
                                    db.collection("imageGallery").doc(doc.id).update({
                                        'title': title,
                                        'desc': desc
                                    }).then(() => {
                                        console.log("Document updated with ID: ", doc.id);
                                    }).catch((error) => {
                                        console.error("Error updating document: ", error);
                                    });
                                }
                            });
                        });
                    });

                    fetch('/adminimg', {
                        method: 'POST'
                    }).then(function (res) {
                        return res.json();
                    }).then(function (data) {
                        console.log(data)
                    }).then(function () {
                        Swal.fire('Saved!', '', 'success');
                    });
                } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                }
            })
        } // end saveChanges() function
    });

    /////////////////////////// VIDEOS //////////////////////////////// 
    const videosTable = $('#videosTable');
    var addedVideos = [], deletedVideosIds = [];
    addBtn2.hide();
    //update videos in slider
    $('.updatevideos').on('click', function () {
        $('#admin-section h1').hide(500);
        $('#admin-section .row').hide(500);
        backBtn.show(500);
        addBtn2.show(500);
        saveBtn.show(500);
        $('#table-wrapper').show(500)
        videosTable.show(500);
        addBtn2.on('click', addVideo);
        saveBtn.on('click', saveVideos);

        $("td").on('click', function () {
            var th = $(this).closest('table').find('th').eq($(this).index());
            var columnName = (th[0].innerText);
            if (columnName == 'Title') { //edit only title
                if ($(this).attr("contentEditable") == true) {
                    $(this).attr("contentEditable", "false");
                } else {
                    $(this).attr("contentEditable", "true");
                }
            }
        });

        $('.bi-trash').on('click', function () {
            var tableRow = $(this).closest("td").parent().text();
            var tableRowContent = tableRow.match(/\b(\w+)\b/g);
            // console.log(tableRowContent)
            var id = tableRowContent[0];
            deletedVideosIds.push(id);
            tableRow = $(this).closest("td").parent();
            tableRow.remove();
        });

        function addVideo() {
            // get table data
            var tableRows = videosTable[0].rows;
            var id = 0;
            for (var i = 0; i < tableRows.length - 1; i++) { //-1 for the thead
                var objCells = tableRows.item(i + 1).cells;
                let idRow = objCells[0].textContent;
                if (idRow > id) {
                    id = idRow;
                }
            }
            id++;
            console.log(id)

            var glightboxform = GLightbox({
                selector: '.glightboxform2',
                closeOnOutsideClick: false,
                draggable: false
            });
            glightboxform;

            glightboxform.on('slide_after_load', (data) => {
                const { slideIndex, slideNode, slideConfig, player, trigger } = data;

                //close form
                var cancelbtn = slideNode.querySelector('.cancel');
                cancelbtn.addEventListener('click', function () {
                    glightboxform.close();
                });

                //attach thumbnail to form
                var uploadbtn = slideNode.querySelector('#videothumbupload');
                var image, file, iconImg;
                uploadbtn.addEventListener('change', function (e) {
                    var imgdiv = slideNode.querySelector('#uploadedimgvideo');
                    imgdiv.innerHTML = '';
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        file = tgt.files[0];
                        image = `<img src="${e.target.result}" style="width:100px;height:auto;">`;
                        iconImg = e.target.result;
                        imgdiv.innerHTML = image; //append under the input
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                var video, uploadbtnvideo = slideNode.querySelector('#videoupload');
                uploadbtnvideo.addEventListener('change', function (e) {
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        video = tgt.files[0];
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                //add data to table and close form
                var addbtn = slideNode.querySelector('.add');
                addbtn.addEventListener('click', function () {
                    var title = slideNode.querySelector('#videotitle').value;
                    var path = image;
                    if (title !== undefined && path !== undefined) {
                        var row = videosTable[0].insertRow(videosTable[0].length);
                        var j = 0;
                        var cell0 = row.insertCell(j++); //id hidden
                        var cell1 = row.insertCell(j++); //thumbnail
                        var cell2 = row.insertCell(j++); //title
                        var cell3 = row.insertCell(j++); //trash icon

                        cell0.innerText = id;
                        cell0.style.display = 'none';

                        var img = document.createElement('img');
                        img.setAttribute('src', iconImg); //thumbnail
                        img.setAttribute('height', '25px');
                        img.setAttribute('width', 'auto');
                        cell1.appendChild(img);

                        cell2.innerHTML = title;
                        cell3.innerHTML = '<i class="bi bi-trash"></i>';

                        addedVideos.push({
                            id: id,
                            title: title,
                            href: '-',
                            file: video,
                            thumb: file
                        });

                        id++;
                        glightboxform.close(); //close form
                    }
                });
            });
        } // end addvideo() function

        async function saveVideos() {
            console.log(addedVideos.length, 'videouri de salvat')
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: `Save`,
                denyButtonText: `Don't save`,
            }).then(function (result) {
                if (result.isConfirmed) {
                    console.log('saving changes for videos...')

                    //DELETE FROM DB
                    deletedVideosIds.forEach(function (id) {
                        db.collection("videos").get().then((querySnapshot) => {
                            querySnapshot.forEach(function (doc) {
                                if (doc.data().id == id) {
                                    //delete from storage
                                    // var vidRef = videosRef.child(`videos/${doc.data().name}`);
                                    // vidRef.delete()
                                    //     .then(console.log('image was deleted from firebase storage'))
                                    //     .catch(console.log('there has been an error while deleting img from fb storage'))

                                    // delete image from DB
                                    db.collection("videos").doc(doc.id).delete().then(() => {
                                        console.log("Document successfully deleted!", doc.id, doc.data().id);
                                    }).catch((error) => {
                                        console.error("Error deleting document: ", error);
                                    });
                                }
                            });
                        })
                    });

                    console.log('deleted videos', deletedVideosIds)


                    //ADD
                    addedVideos.forEach(async function (video) {
                        //thumbnail
                        var vidRef = videosRef.child(`videos/${video.thumb.name}`);
                        await vidRef.put(video.thumb).then(function () {
                            console.log('uploaded a video thumbnail to firebase storage!');
                            vidRef.getDownloadURL().then(function (url) {
                                video.thumb = url;
                            });
                        });

                        //video
                        vidRef = videosRef.child(`videos/${video.file.name}`);
                        vidRef.put(video.file).then(function (snapshot) {
                            console.log('Uploaded a video to firebase storage!');
                            vidRef.getDownloadURL().then(function (url) {
                                video.href = url;
                                //add to firebase DB
                                db.collection("videos").add({
                                    name: video.file.name,
                                    id: video.id,
                                    title: video.title,
                                    href: video.href,
                                    thumb: video.thumb
                                })
                                    .then((docRef) => {
                                        console.log("Added new video to DB. Document written with ID: ", docRef.id);
                                        addedVideos.splice(0, 1);//remove first element
                                    })
                                    .catch((error) => {
                                        console.error("Error adding document: ", error);
                                    });
                            });
                        });
                    });

                    // get table data; update for title or description
                    var tableRows = videosTable[0].rows;
                    var tableRowsArray = Object.values(tableRows);
                    tableRowsArray.splice(0, 1); //remove header

                    tableRowsArray.forEach(function (tr) {
                        var objCells = tr.cells;
                        var id = objCells[0].innerText;
                        var title = objCells[2].innerHTML;

                        console.log(tr)
                        //UPDATE FOR TITLE 
                        db.collection("videos").get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                if (doc.data().id == id) {
                                    // update image title and desc
                                    db.collection("videos").doc(doc.id).update({
                                        'title': title,
                                    }).then(() => {
                                        console.log("Document updated with ID: ", doc.id);
                                    }).catch((error) => {
                                        console.error("Error updating document: ", error);
                                    });
                                }
                            });
                        });
                    });

                    fetch('/adminvideo', {
                        method: 'POST'
                    }).then(function (res) {
                        return res.json();
                    }).then(function (data) {
                        console.log(data)
                    }).then(function () {
                        Swal.fire('Saved!', '', 'success');
                    });
                } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                }
            })
        }
    });

    /////////////////// SHOP ITEMS ////////////////
    const itemsTable = $('#itemsTable');
    var deletedItemsIds = [], addedItems = [];
    addBtn3.hide();
    //update items in shop
    $('.updateshop').on('click', function() {
        $('#admin-section h1').hide(500);
        $('#admin-section .row').hide(500);
        backBtn.show(500);
        addBtn3.show(500);
        saveBtn.show(500);
        $('#table-wrapper').show(500)
        itemsTable.show(500);
        addBtn3.on('click', addItem);
        saveBtn.on('click', saveItems);

        $("td").on('click', function () {
            var th = $(this).closest('table').find('th').eq($(this).index());
            var columnName = (th[0].innerText);
            if (columnName == 'Name' || columnName == 'Price') { //edit
                if ($(this).attr("contentEditable") == true) {
                    $(this).attr("contentEditable", "false");
                } else {
                    $(this).attr("contentEditable", "true");
                }
            }
        });

        $('.bi-trash').on('click', function () {
            var tableRow = $(this).closest("td").parent().text();
            var tableRowContent = tableRow.match(/\b(\w+)\b/g);
            // console.log(tableRowContent)
            var id = tableRowContent[0];
            deletedItemsIds.push(id);
            tableRow = $(this).closest("td").parent();
            tableRow.remove();
        });

        function addItem() {
            // get table data
            var tableRows = itemsTable[0].rows;
            var id = 0;
            for (var i = 0; i < tableRows.length - 1; i++) { //-1 for the thead
                var objCells = tableRows.item(i + 1).cells;
                let idRow = objCells[0].textContent;
                if (idRow > id) {
                    id = idRow;
                }
            }
            id++;
            console.log(id)

            var glightboxform = GLightbox({
                selector: '.glightboxform3',
                closeOnOutsideClick: false,
                draggable: false
            });
            glightboxform;

            glightboxform.on('slide_after_load', (data) => {
                const { slideIndex, slideNode, slideConfig, player, trigger } = data;

                //close form
                var cancelbtn = slideNode.querySelector('.cancel');
                cancelbtn.addEventListener('click', function () {
                    glightboxform.close();
                });

                //upload and attach thumbnail(image) to form
                var uploadbtn = slideNode.querySelector('#itemthumbupload');
                var image, iconImg, thumbnail;
                uploadbtn.addEventListener('change', function (e) {
                    var imgdiv = slideNode.querySelector('#uploadedimgitem');
                    imgdiv.innerHTML = '';
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        image = `<img src="${e.target.result}" style="width:100px;height:auto;">`;
                        iconImg = e.target.result; //for table
                        imgdiv.innerHTML = image; //append under the input
                        thumbnail = tgt.files[0];
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                //upload image video or 3D object
                var file, uploadbtnfile = slideNode.querySelector('#itemupload');
                uploadbtnfile.addEventListener('change', function (e) {
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        file = tgt.files[0]; //image, video or 3D object
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                uploadbtn = slideNode.querySelector('#itempreviewupload');
                var preview;
                uploadbtn.addEventListener('change', function (e) {
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        preview = tgt.files[0]; //preview for shop
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                //add data to table and close form
                var addbtn = slideNode.querySelector('.add');
                addbtn.addEventListener('click', function () {
                    var name = slideNode.querySelector('#itemname').value;
                    var price = slideNode.querySelector('#itemprice').value;
                    if (name !== undefined && price !== undefined) {
                        var row = itemsTable[0].insertRow(itemsTable[0].length);
                        var j = 0;
                        var cell0 = row.insertCell(j++); //id hidden
                        var cell1 = row.insertCell(j++); //thumbnail
                        var cell2 = row.insertCell(j++); //name
                        var cell3 = row.insertCell(j++); //price
                        var cell6 = row.insertCell(j++); //trash icon

                        cell0.innerText = id;
                        cell0.style.display = 'none';

                        var img = document.createElement('img');
                        img.setAttribute('src', iconImg); //thumbnail
                        img.setAttribute('height', '25px');
                        img.setAttribute('width', 'auto');
                        cell1.appendChild(img);

                        cell2.innerHTML = name;
                        cell3.innerHTML = price;
                        cell6.innerHTML = '<i class="bi bi-trash"></i>';

                        console.log(name)
                        addedItems.push({
                            id: id,
                            name: name,
                            price: price,
                            href: '-',
                            file: file,
                            thumb: thumbnail,
                            filename: file.name,
                            preview: preview,
                            prevExtension : preview.name.split('.')[1]
                        });

                        id++;
                        glightboxform.close(); //close form
                    }
                });
            });
        } // end additem() function

        async function saveItems() {
            console.log(addedItems.length, 'iteme de salvat')
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: `Save`,
                denyButtonText: `Don't save`,
            }).then(function (result) {
                if (result.isConfirmed) {
                    console.log('saving changes for shop items...')

                    //DELETE FROM DB
                    deletedItemsIds.forEach(function (id) {
                        db.collection("shop").get().then((querySnapshot) => {
                            querySnapshot.forEach(function (doc) {
                                if (doc.data().id == id) {
                                    //delete from storage
                                    // var itemRef = shopRef.child(`shop/${doc.data().name}`);
                                    // itemRef.delete()
                                    //     .then(console.log('item was deleted from firebase storage'))
                                    //     .catch(console.log('there has been an error while deleting item from fb storage'))

                                    // delete image from DB
                                    db.collection("shop").doc(doc.id).delete().then(() => {
                                        console.log("Document successfully deleted!", doc.id, doc.data().id);
                                    }).catch((error) => {
                                        console.error("Error deleting document: ", error);
                                    });
                                }
                            });
                        })
                    });

                    console.log('deleted items', deletedItemsIds)

                    //ADD
                    addedItems.forEach(async function (item) {
                        // preview
                        var itemRef = shopRef.child(`shop/${item.preview.name}`);
                        await itemRef.put(item.preview).then(function () {
                            console.log('uploaded an item preview to firebase storage!');
                            itemRef.getDownloadURL().then(function (url) {
                                item.preview = url;
                            });
                        });

                        //thumbnail
                        var itemRef = shopRef.child(`shop/${item.thumb.name}`);
                        await itemRef.put(item.thumb).then(function () {
                            console.log('uploaded an item thumbnail to firebase storage!');
                            itemRef.getDownloadURL().then(function (url) {
                                item.thumb = url;
                            });
                        });

                        //file
                        itemRef = shopRef.child(`shop/${item.file.name}`);
                        itemRef.put(item.file).then(function (snapshot) {
                            console.log('Uploaded an item to firebase storage!');
                            itemRef.getDownloadURL().then(function (url) {
                                item.href = url;
                                //add to firebase DB
                                db.collection("shop").add({
                                    name: item.name,
                                    filename: item.file.name,
                                    id: item.id,
                                    href: item.href, //for the sold file
                                    thumb: item.thumb, 
                                    price: item.price,
                                    preview: item.preview,
                                    prevExtension: item.prevExtension //jpg png mp4 etc
                                })
                                    .then((docRef) => {
                                        console.log("Added new item to DB. Document written with ID: ", docRef.id);
                                        addedItems.splice(0, 1);//remove first element
                                    })
                                    .catch((error) => {
                                        console.error("Error adding document: ", error);
                                    });
                            });
                        });
                    });

                    // get table data; update for name or price
                    var tableRows = itemsTable[0].rows;
                    var tableRowsArray = Object.values(tableRows);
                    tableRowsArray.splice(0, 1); //remove header

                    tableRowsArray.forEach(function (tr) {
                        var objCells = tr.cells;
                        var id = objCells[0].innerText;
                        var name = objCells[2].innerHTML;
                        var price = objCells[3].innerHTML;

                        console.log(tr)
                        //UPDATE FOR name or price
                        db.collection("shop").get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                if (doc.data().id == id) {
                                    // update price or name
                                    db.collection("shop").doc(doc.id).update({
                                        'name': name,
                                        'price': price
                                    }).then(() => {
                                        console.log("Document updated with ID: ", doc.id);
                                    }).catch((error) => {
                                        console.error("Error updating document: ", error);
                                    });
                                }
                            });
                        });
                    });

                    fetch('/adminshop', {
                        method: 'POST'
                    }).then(function (res) {
                        return res.json();
                    }).then(function (data) {
                        console.log(data)
                    }).then(function () {
                        Swal.fire('Saved!', '', 'success');
                    });
                } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                }
            })
        }
    });

    /////////////////// FUTURE WORKS //////////////////
    const worksTable = $('#worksTable');
    var deletedWorksIds = [], addedWorks = [];
    addBtn4.hide();
    //update future works
    $('.updateworks').on('click', function () {
        $('#admin-section h1').hide(500);
        $('#admin-section .row').hide(500);
        backBtn.show(500);
        addBtn4.show(500);
        saveBtn.show(500);
        $('#table-wrapper').show(500)
        worksTable.show(500);
        addBtn4.on('click', addWorks);
        saveBtn.on('click', saveWorks);

        $('.bi-trash').on('click', function () {
            var tableRow = $(this).closest("td").parent().text();
            var tableRowContent = tableRow.match(/\b(\w+)\b/g);
            // console.log(tableRowContent)
            var id = tableRowContent[0];
            deletedWorksIds.push(id);
            tableRow = $(this).closest("td").parent();
            tableRow.remove();
        });

        function addWorks() {
            // get table data
            var tableRows = worksTable[0].rows;
            var id = 0;
            for (var i = 0; i < tableRows.length - 1; i++) { //-1 for the thead
                var objCells = tableRows.item(i + 1).cells;
                let idRow = objCells[0].textContent;
                if (idRow > id) {
                    id = idRow;
                }
            }
            id++;
            console.log(id)

            var glightboxform = GLightbox({
                selector: '.glightboxform4',
                closeOnOutsideClick: false,
                draggable: false
            });
            glightboxform;

            glightboxform.on('slide_after_load', (data) => {
                const { slideIndex, slideNode, slideConfig, player, trigger } = data;

                //close form
                var cancelbtn = slideNode.querySelector('.cancel');
                cancelbtn.addEventListener('click', function () {
                    glightboxform.close();
                });

                //upload thumbnail 
                var uploadbtn = slideNode.querySelector('#worksthumbupload');
                var image, imageThumb, file, iconImg;
                uploadbtn.addEventListener('change', function (e) {
                    const tgt = e.target;
                    var imgdiv = slideNode.querySelector('#uploadedimgworks');
                    imgdiv.innerHTML = '';
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        imageThumb = tgt.files[0]; //thumbnail image
                        image = `<img src="${e.target.result}" style="width:100px;height:auto;">`;
                        imgdiv.innerHTML = image; //append under the input
                        iconImg = e.target.result; //for table
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                //upload large image
                uploadbtn = slideNode.querySelector('#worksfileupload');
                uploadbtn.addEventListener('change', function (e) {
                    const tgt = e.target;
                    if (tgt.type !== "file") {
                        return;
                    }
                    if (!tgt.files || !tgt.files[0]) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        file = tgt.files[0];
                    }
                    reader.readAsDataURL(tgt.files[0]);
                });

                //add data to table and close form
                var addbtn = slideNode.querySelector('.add');
                addbtn.addEventListener('click', function () {
                    if (file !== undefined) {
                        var row = worksTable[0].insertRow(worksTable[0].length);
                        var j = 0;
                        var cell0 = row.insertCell(j++); //id hidden
                        var cell1 = row.insertCell(j++); //thumbnail
                        var cell2 = row.insertCell(j++); //trash icon

                        cell0.innerText = id;
                        cell0.style.display = 'none';

                        var img = document.createElement('img');
                        img.setAttribute('src', iconImg); //thumbnail
                        img.setAttribute('height', '25px');
                        img.setAttribute('width', 'auto');
                        cell1.appendChild(img);

                        cell2.innerHTML = '<i class="bi bi-trash"></i>';

                        addedWorks.push({
                            id: id,
                            href: '-',
                            file: file,
                            thumb: imageThumb
                        });

                        id++;
                        glightboxform.close(); //close form
                    }
                });
            });
        } // end addvideo() function

        async function saveWorks() {
            console.log(addedWorks.length, 'future works de salvat')
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: `Save`,
                denyButtonText: `Don't save`,
            }).then(function (result) {
                if (result.isConfirmed) {
                    console.log('saving changes for future works...')

                    //DELETE FROM DB
                    deletedWorksIds.forEach(function (id) {
                        db.collection("works").get().then((querySnapshot) => {
                            querySnapshot.forEach(function (doc) {
                                if (doc.data().id == id) {
                                    //delete from storage
                                    // var worksRef = worksRef.child(`works/${doc.data().name}`);
                                    // vidRef.delete()
                                    //     .then(console.log('future works image was deleted from firebase storage'))
                                    //     .catch(console.log('there has been an error while deleting future works img from fb storage'))

                                    // delete future works from DB
                                    db.collection("works").doc(doc.id).delete().then(() => {
                                        console.log("Document successfully deleted!", doc.id, doc.data().id);
                                    }).catch((error) => {
                                        console.error("Error deleting document: ", error);
                                    });
                                }
                            });
                        })
                    });

                    console.log('deleted future works', deletedWorksIds)

                    //ADD
                    addedWorks.forEach(async function (work) {
                        //thumbnail
                        var workRef = worksRef.child(`works/${work.thumb.name}`);
                        await workRef.put(work.thumb).then(function () {
                            console.log('uploaded a future works thumbnail to firebase storage!');
                            workRef.getDownloadURL().then(function (url) {
                                work.thumb = url;
                            });
                        });

                        //file
                        workRef = worksRef.child(`works/${work.file.name}`);
                        workRef.put(work.file).then(function (snapshot) {
                            console.log('Uploaded a future works file to firebase storage!');
                            workRef.getDownloadURL().then(function (url) {
                                work.href = url;
                                //add to firebase DB
                                db.collection("works").add({
                                    name: work.file.name,
                                    id: work.id,
                                    href: work.href,
                                    thumb: work.thumb
                                })
                                    .then((docRef) => {
                                        console.log("Added new future work to DB. Document written with ID: ", docRef.id);
                                        addedWorks.splice(0, 1);//remove first element
                                    })
                                    .catch((error) => {
                                        console.error("Error adding document: ", error);
                                    });
                            });
                        });
                    });

                    fetch('/adminfutureworks', {
                        method: 'POST'
                    }).then(function (res) {
                        return res.json();
                    }).then(function (data) {
                        console.log(data)
                    }).then(function () {
                        Swal.fire('Saved!', '', 'success');
                    });
                } else if (result.isDenied) {
                    Swal.fire('Changes are not saved', '', 'info')
                }
            })
        }
    });
});