$(function() {
    // DO NOT DELETE
    $('#fullpage').fullpage({
        'verticalCentered': false,
        'css3': true,
        'navigation': true,
        'navigationPosition': 'right',
    });

    // Gets the video src from the data-src of the button0
    var $videoSrc;  
    $('#button0').on("click", function() {
        $videoSrc = $(this).data( "src" );
         // when the modal is opened autoplay it  
    $('#myModal').on('show.bs.modal', function (e) {
    // set the video src to autoplay and not to show related video.
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0" ); 
    })
     // stop playing the youtube video when I close the modal
    $('#myModal').on('hidden.bs.modal', function (e) {
        // a poor man's stop video
        $("#video").attr('src',$videoSrc); 
    }) 
    });
    console.log($videoSrc);

   
    
   
        
    // document ready  
    
     $('#html5-videos').lightGallery(); 
    });