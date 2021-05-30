$(function () {
    var imagesRef = storage.ref();

    const tables = $('.getdata table');
    const backBtn = $('.getdata #backbtn');
    const addBtn = $('.getdata #addbtn');
    const saveBtn = $('.getdata #savebtn');
    tables.hide();
    backBtn.hide();
    addBtn.hide();
    saveBtn.hide();

    backBtn.on('click', function () {
        $('#admin-section h1').show(500);
        $('#admin-section .row').show(500);
        tables.hide(500);
        backBtn.hide(500);
        addBtn.hide(500);
        saveBtn.hide(500);
    });

    const buttons = $('.btn-group-vertical');
    buttons[0].addEventListener('click', function () {
        $('#admin-section h1').hide(500);
        $('#admin-section .row').hide(500);
        backBtn.show(500);
        addBtn.show(500);
        saveBtn.show(500);
    });

    const imgsTable = $('#imagesTable');
    var deletedImagesIds = [], addedImages = [];

    // update image gallery
    $('.updategallery').on('click', function () {
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
                console.log('saving changes...')

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
                                    console.log(doc.id)
                                    console.log("Document successfully deleted!", doc.id, doc.data().id);
                                }).catch((error) => {
                                    console.error("Error deleting document: ", error);
                                });
                            }
                        });
                    })
                });

                console.log(deletedImagesIds)


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
                                href: img.href
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