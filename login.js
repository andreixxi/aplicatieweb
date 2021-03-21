$(function () {
    // toggle login <-> register 
    $(window).on("hashchange", function () {
        if (location.hash.slice(1) == "register") {
            $(".card").addClass("extend");
            $("#login").removeClass("selected");
            $("#register").addClass("selected");
        } else {
            $(".card").removeClass("extend");
            $("#login").addClass("selected");
            $("#register").removeClass("selected");
        }
    });
    $(window).trigger("hashchange");

    /////
    $('#login-btn').on('click', function () {
        $('.auth-form').toggle('slow');
        // $("body").css({"opacity": "0.5"});
    });

    /////////////////////////////
    var email = "", password = "", emailError = "", passwordError = "";

    function clearInputs() {
        email = "";
        password = "";
    }

    function clearErrors() {
        emailError = "";
        passwordError = "";
    }

    function handleLogin() {
        clearErrors();
        firebaseApp
            .auth()
            .signInWithEmailAndPassword(email, password)
            .catch(error => {
                switch (error.code) {
                    case "auth/invalid-email":
                    case "auth/user-disabled":
                    case "auth/user-not-found":
                        setEmailError(error.message);
                        break;
                    case "auth/wrong-password":
                        setPasswordError(error.message);
                        break;
                }
            });
    }

    function handleSingup() {
        clearErrors();
        firebaseApp
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .catch(error => {
                switch (error.code) {
                    case "auth/email-already-in-use":
                    case "auth/invalid-email":
                        setEmailError(error.message);
                        break;
                    case "auth/weak-password":
                        setPasswordError(error.message);
                        break;
                }
            });
    }

    function handleLogout() {
        firebaseApp.auth().signOut();
    };
});