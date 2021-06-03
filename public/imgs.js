export default function faceMorphing() {
    const formData = new FormData();
    $('#resbtn').hide();
    $('#downloadbtn').hide();
    $(".uploadbuttons").on("change", function (e) {
        $('#resbtn').hide();
        $('#downloadbtn').hide();
        $("#appendResult").html('');
        const tgt = e.target;
        if (tgt.type !== "file") {
            return;
        }
        if (!tgt.files || !tgt.files[0]) {
            return;
        }
        const reader = new FileReader();
        const idx = tgt.id.replace("picture", "");
        formData.set(`image${idx}`, tgt.files[0]); // set image with index idx
        reader.onload = async function (e) {
            const image = `<img src="${e.target.result}" style="width:20vw;height:auto;" id="image${idx}-morph">`;
            $("#appendimg" + idx).html(image); //append under the input

            if ($(".uploadbuttons").find("img").length === 2) { //start the algorithm
                await fetch('/saveImage', {
                    method: 'POST',
                    body: formData
                }).then(function (res) {
                    // console.log(res.json());
                }).then(function (data) {
                    // console.log(data);
                });

                await fetch('/processImg', {
                    method: 'POST',
                    body: formData
                }).then(async function (res) {
                    // console.log(res.json());
                    await res.text().then(function (img) {
                        $('#resbtn').show(500);
                        $('#resbtn').on('click', function () {
                            const image = `<img src="${img}" style="width:20vw;height:auto;">`;
                            $("#appendResult").html(image); //append result
                            $('#downloadbtn').show(500);
                        });

                        $('#downloadbtn').on('click', function () {
                            var url = img;
                            url = url.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
                            saveAs(url, 'MorphedFace.jpg'); //path + name
                        });
                    });
                }).then(function (data) {
                    // console.log(data);
                });
            }
        };
        reader.readAsDataURL(tgt.files[0]);
    });
}