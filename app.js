$(function () {
  // FULLPAGE FOR SCROLL AND MENU 
  $('#fullpage').fullpage({
    menu: '#menu',
    anchors: ['home', '3d-view', 'images', 'videos', 'shop', 'contact'],
    // sectionsColor: ['', '#7BAABE', '', '#7BAABE'], //Define the CSS background-color property for each section
    css3: true,
    controlArrows: true, //Determines whether to use control arrows for the slides to move right or left.
    onLeave: function (origin, destination, direction) {
      if (destination.isLast == true) {
        $('#footer').hide(500);
      } else {
        $('#footer').show(500);
      }

      if (destination.anchor == '3d-view') {
        $('#threedbody').show(500);
        // $('#stats').show(500);
         $('#panel').show(500);
      }
      else {
        $('#threedbody').hide(500);
        // $('#stats').hide(500);
        $('#panel').hide(500);
      }
    }
  });

  $('#footer i').on('click', function () {
    fullpage_api.moveSectionDown(); // go to next section when clicking footer
  });

  // MENU
  {
    $('.navigation .toggle-wrapper .show').on('click', function () {
      $('.navigation').addClass('open');
    });

    $('.navigation .toggle-wrapper .hide').on('click', function () {
      $('.navigation').removeClass('open');
    });

    // CLOSE MENU AFTER CHOOSING 1 PAGE
    $('.navigation .menu li').on('click', function () {
      $('.navigation').removeClass('open');
    });
  }

  // HOME BUTTON: GO TO 1ST PAGE
  $('#home-btn').on('click', function () {
    fullpage_api.moveTo('home');
  });


  // SHARE BUTTON
  // OPEN THE BUTTONS AND SMALL ANIMATION
  $(document).on('click', '#socialShare > .socialBox', function () {
    var self = $(this);
    var element = $('#socialGallery a');
    var c = 0;
    if (self.hasClass('animate')) {
      return;
    }
    if (!self.hasClass('open')) {
      self.addClass('open');
      TweenMax.staggerTo(element, 0.3, {
        opacity: 1,
        visibility: 'visible'
      },
        0.075);
      TweenMax.staggerTo(element, 0.3, {
        top: -12,
        ease: Cubic.easeOut
      },
        0.075);
      TweenMax.staggerTo(element, 0.2, {
        top: 0,
        delay: 0.1,
        ease: Cubic.easeOut,
        onComplete: function () {
          c++;
          if (c >= element.length) {
            self.removeClass('animate');
          }
        }
      },
        0.075);
      self.addClass('animate');
    } else {
      TweenMax.staggerTo(element, 0.3, {
        opacity: 0,
        onComplete: function () {
          c++;
          if (c >= element.length) {
            self.removeClass('open animate');
            element.css('visibility', 'hidden');
          };
        }
      },
        0.075);
    }
  });

  // ACTUAL SHARE
  {
    const facebookBtn = document.querySelector(".facebook");
    const twitterBtn = document.querySelector(".twitter");
    const whatsappBtn = document.querySelector(".whatsapp");

    function init() {

      let postUrl = encodeURI(document.location.href);
      let postTitle = encodeURI("Hi everyone!! Check out this website: ");
      /* 
     whatsapp https://api.whatsapp.com/send?text=[post-title] [post-url]
     fb https://www.facebook.com/sharer.php?u=[post-url]
     twitter https://twitter.com/share?url=[post-url]&text=[post-title]&via=[via]&hashtags=[hashtags]
     */
      facebookBtn.setAttribute("href", `https://www.facebook.com/sharer.php?u=${postUrl}`);
      twitterBtn.setAttribute("href", `https://twitter.com/share?url=${postUrl}&text=${postTitle}`);
      whatsappBtn.setAttribute("href", `https://wa.me/?text=${postTitle} ${postUrl}`);
    }

    init();
  }

  //////////////////////////////////////////////////////////////
  firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        localStorage.setItem('user', true);
        console.log("user is signed in");
        $('#signout').show();
        $('#login-btn').hide();
      } else {
        // No user is signed in.
        localStorage.setItem('user', false);
        console.log("no user is signed in");
        $('#login-btn').show();
        $('#signout').hide();
      }
  });

  // INITIALISE IMAGE GALLERY
  lc_lightbox('.mybox', {
    wrap_class: 'lcl_face_oc',
    gallery: true,
    skin: 'dark',
    counter: true,
    fullscreen: true,
    socials: true,
    ol_opacity: 0.5, //lightbox overlay's opacity
    ol_color: '#333', //lightbox overlay's color	
    border_w: 5,
    border_col: '#ddd',
    radius: 5,
    nav_btn_pos: 'middle',
    rclick_prevent: true,
    elems_parsed: function (opts) {
      opts['download'] = (localStorage.getItem('user') === 'true' && true);
    }
    /*vezi metoda fb_direct_share la: https://lcweb.it/lc-lightbox/documentation?section=opts*/
  });

  // firebase.auth().signOut();
  //////////////////////////////////////////////////////////////
  // video gallery, pentru mobile sa am directie ttb + heightRatio setat
  splide = new Splide('.splide', {
    // https://www.cssscript.com/carousel-splide/   ++++ https://splidejs.com/
    perPage: 4,
    rewind: true,
    speed: 1000,
    gap: '2.1em',
    padding: '2em',
    arrowPath: 'M16 15v4l8-8.035-8-7.965v4s-13.277 2.144-16 14c5.796-6.206 16-6 16-6z',
    pagination: false,
    autoplay: true,
    lazyLoad: 'nearby',
    breakpoints: {
      '1000': {
        perPage: 3,
        gap: '2em',
      },
      '900': {
        perPage: 2,
        gap: '2em'
      },
      '650': {
        perPage: 1,
        gap: '2em'
      }
    },
    video: {
      loop: true,
      volume: 1,
      disableOverlayUI: true // hides the play button
    },
  }).mount(window.splide.Extensions);

});