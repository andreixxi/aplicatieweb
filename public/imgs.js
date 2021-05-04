$(function () {
    const formData = new FormData();
    $(".uploadbuttons").on("change", function (e) {
        const tgt = e.target;
        if (tgt.type !== "file") {
            return;
        }
        if (!tgt.files || !tgt.files[0]) {
            return;
        }
        const reader = new FileReader();
        const idx = tgt.id.replace("picture", "");
        formData.append(`image${idx}`, tgt.files[0]); // append image with index idx
        reader.onload = async function (e) {
            const image = `<img src="${e.target.result}" style="width:400px;height:auto;" id="image${idx}-morph">`;
            $("#appendimg" + idx).html(image);
            if ($(".uploadbuttons").find("img").length === 2) {
                await fetch('/saveImage', {
                    method: 'POST',
                    body: formData
                }).then(function (res) {
                    // console.log(res.json());
                }).then(function (data) {
                    // console.log(data);
                });

                await fetch('/processImg', {
                    method: 'GET',
                }).then(async function (res) {
                    // console.log(res.json());
                    await res.text().then(function (img) {
                        $('#resbtn').on('click', async function () {
                            console.log(typeof img);
                            const image = `<img src="${img}" style="width:400px;height:auto;">`;
                            $("#appendResult").html(image);
                        });
                    });
                }).then(function (data) {
                    // console.log(data);
                });

            }
        };
        reader.readAsDataURL(tgt.files[0]);
    });
});