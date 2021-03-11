$(function() {
    // DO NOT DELETE
    $('#fullpage').fullpage({
        'verticalCentered': false,
        'css3': true,
        'navigation': true,
        'navigationPosition': 'right',
    });

    // for image gallery
    lc_lightbox('.mybox', {
        wrap_class: 'lcl_face_oc',
        gallery: true, 
        skin: 'dark',
        counter: true,
        fullscreen: true,
        download: true,
        socials: true,
        ol_opacity: 0.5,
        ol_color: '#333',
        border_w: 5,
        border_col: '#ddd',
        radius: 5
    });

    // video gallery
    new Splide( '.splide', {
        perPage: 3,
        rewind : true,
    } ).mount(window.splide.Extensions);
});