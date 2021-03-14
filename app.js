$(function () {
    // DO NOT DELETE
    $('#fullpage').fullpage({
        menu: '#menu',
        anchors: ['main', '3d-view', 'images', 'videos'],
        sectionsColor: ['', '#7BAABE', '#7BAABE', '#7BAABE'], //Define the CSS background-color property for each section
        css3: true,
        controlArrows: true, //Determines whether to use control arrows for the slides to move right or left.
        // fixedElements: '#sidebar',

    });

    //menu
    $('.navigation .toggle-wrapper .show').on('click', function () {
        $('.navigation').addClass('open');
    });

    $('.navigation .toggle-wrapper .hide').on('click', function () {
        $('.navigation').removeClass('open');
        // $('.navigation.menu').hide();
    });

    $('.navigation .menu li').on('click', function() {
        $('.navigation').removeClass('open');
    });
    
    //////////////////////////////////////////////////////////////
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
    //////////////////////////////////////////////////////////////
    // video gallery

    new Splide('.splide', {
        perPage: 3,
        rewind: true,
    }).mount(window.splide.Extensions);
    //////////////////////////////////////////////////////////////
    // MENU
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#dismiss, .overlay').on('click', function () {
        // hide sidebar
        $('#sidebar').removeClass('active');
        // hide overlay
        $('.overlay').removeClass('active');
    });

    $('#sidebarCollapse').on('click', function () {
        // open sidebar
        $('#sidebar').addClass('active');
        // fade in the overlay
        $('.overlay').addClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });



});