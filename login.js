$(function () {
    // toggle login <-> register 
    $(window).on("hashchange", function () {
        if (location.hash.slice(1) == "register") {
            $(".card").addClass("extend");
            $("#login").removeClass("selected");
            $("#register").addClass("selected");
            $('#authProviders').hide();
        } else {
            $(".card").removeClass("extend");
            $("#login").addClass("selected");
            $("#register").removeClass("selected");
            $('#authProviders').show();
        }
    });
    $(window).trigger("hashchange");

    ///// show signin/signup form when clicking on icon
    $('#login-btn').on('click', function () {
        $('.auth-form').toggle('slow');
        // $("body").css({"opacity": "0.5"});
    });

    // SIGN UP
    $('#signup').on('click', function () {
        var email = $('#remail').val();
        var password = $('#rpassword').val();
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function () {
                console.log('signed up');
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                alert(error.code, error.message);
            });
    });

    //SIGN IN WITH PROVIDERS
    $('#googlesignin').on('click', function () { 
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with google');
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                alert(error.code, error.message);
                console.log(error.code, error.message);
            });
    });

    $('#facebooksignin').on('click', function () {
        var provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with facebook');
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                alert(error.code, error.message);
            });
    });

    $('#twittersignin').on('click', function () {
        var provider = new firebase.auth.TwitterAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with facebook');
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                alert(error.code, error.message);
            });
    });

    $('#yahoosignin').on('click', function (){
        var provider = new firebase.auth.OAuthProvider('yahoo.com');
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with facebook');
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                alert(error.code, error.message);
            });
    })
    // SIGN IN WITH EMAIL AND PASSWORD
    $('#signin').on('click', function () {
        var email = $('#lemail').val();
        var password = $('#lpassword').val();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function () {
                console.log('signed in');
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                
                // switch(error.code) {
                //     case "auth/invalid-email":
                //     case "":
                //         $('.errorMsg').append(erorr.message);
                //         alert(error.code, error.message);
                //         break
                // }
                console.log(error.code, error.message);
                alert(error.message);
                $('.errorMsg').append(erorr.message);
            });
    });

    //SIGN OUT
    $('#signout').on('click', function(){
        firebase.auth().signOut()
            .then(() => {
                console.log('signed out');
                $('#login-btn').show(1000);
                $('#signout').hide(1000);
            })
            .catch((error) => {
                alert(error.code, error.message);
            });
    });
});