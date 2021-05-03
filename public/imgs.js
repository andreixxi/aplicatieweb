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
                console.log("Both images were uploaded, algorithm starting...");
                await fetch('/saveImage', {
                    method: 'POST',
                    body: formData
                }).then(function (res) {
                    // console.log(res.json());
                }).then(function (data) {
                    // console.log(data);
                });

                fetch('/processImg', {
                    method: 'POST',
                }).then(function (res) {
                    // console.log(res.json());
                }).then(function (data) {
                    // console.log(data);
                });
            }
        };
        reader.readAsDataURL(tgt.files[0]);
    });
});