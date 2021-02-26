$(function() {
    // DO NOT DELETE
    $('#fullpage').fullpage({
        'verticalCentered': false,
        'css3': true,
        'navigation': true,
        'navigationPosition': 'right',
    });

    $(".video-btn").on("click", function() {
        var theModal = $(this).data("target"),
            videoSRC = $(this).attr("data-video"),
            videoSRCauto = videoSRC + "?modestbranding=1&rel=0&controls=0&showinfo=0&html5=1&autoplay=1";

            $(theModal + ' iframe').attr('src', videoSRCauto); // set the video source 

            $(theModal + ' button.close').on("click", function () {
                $(theModal + ' iframe').attr('src', videoSRC);
              });
    });
});