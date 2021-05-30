
$(function () {
    // toggle login <-> register 
    $(window).on("hashchange", function () {
        if (location.hash.slice(1) == "register") {
            $("#auth .card").addClass("extend");
            $("#login").removeClass("selected");
            $("#register").addClass("selected");
            $('#authProviders').hide();
        } else {
            $("#auth .card").removeClass("extend");
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

    function getRandomString(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    async function digestMessage(message) {
        const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8);           // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
        return hashHex;
    }

    function firebaseAddUser(email, salt, hash) {
        db.collection("users").add({
            email: email,
            salt: salt,
            hash: hash
        })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }

    // SIGN UP
    $('#signup').on('click', async function () {
        var valid = true; //check if both email and pass have been completed
        $('.registerform input').each(function () {
            if ($(this).val() == "") {
                valid = false;
            }
        });

        if (valid) {
            var email = $('#remail').val();
            var rawPassword = $('#rpassword').val();

            var salt, passSalt, hash;
            salt = getRandomString(64); // salt of length 64 
            passSalt = rawPassword.concat(salt); // concat password and salt
            hash = await digestMessage(passSalt); // apply hash function

            firebase.auth().createUserWithEmailAndPassword(email, hash)
                .then(function () {
                    console.log('signed up');
                    // localStorage.setItem('user', true);
                    // hide auth form and show sign out button
                    $('#login-btn').hide(1000);
                    $('#signout').show(1000);
                    $('.auth-form').hide(1000);
                    // add to db
                    firebaseAddUser(email, salt, hash);
                })
                .catch((error) => {
                    console.log('error');
                    if (email && hash) {
                        setTimeout(function () {
                            $('.errorMsg').text('Signup process failed. You could try using another email.');
                        });
                        setTimeout(function () {
                            $('.errorMsg').text('');
                        }, 3000);
                    }
                });
        }
    });

    // show error for signin
    function showError() {
        setTimeout(function () {
            $('.errorMsg').text('Signin process failed. Please check your email or password.');
        });
        setTimeout(function () {
            $('.errorMsg').text('');
        }, 3000);
    }

    // SIGN IN WITH EMAIL AND PASSWORD
    $('#signin').on('click', function () {
        var valid = true; //check if both email and pass have been completed
        $('.loginform input').each(function () {
            if ($(this).val() == "") {
                valid = false;
            }
        });
        if (valid) {
            var email = $('#lemail').val();
            var rawPassword = $('#lpassword').val();
            var found = 0;
            db.collection("users").get().then(function (querySnapshot) {
                querySnapshot.forEach(async function (doc) {
                    if (email == doc.data().email) { // found the email in db
                        found = 1;
                        var dbHash = doc.data().hash; // get hash and salt from the user stored in db
                        var dbSalt = doc.data().salt;
                        var passSalt = rawPassword.concat(dbSalt); //concat pass and salt
                        var newHash = await digestMessage(passSalt); // apply hash function
                        firebase.auth().signInWithEmailAndPassword(email, newHash)
                            .then(function () {
                                console.log('signed in');
                                // localStorage.setItem('user', true);
                                // hide auth form and show sign out button
                                $('#login-btn').hide(1000);
                                $('#signout').show(1000);
                                $('.auth-form').hide(1000);
                            })
                            .catch((error) => {
                                showError(); // WRONG PASSWORD
                            });
                    } // END IF EMAIL == DOC.DATA().EMAIL
                }); // END QUERY
                if (found == 0) {
                    showError(); // EMAIL NOT IN DB
                }
            })
                .catch((error) => {
                    console.log("Error getting document:", error);
                });
        }
    });

    //SIGN IN WITH PROVIDERS
    $('#googlesignin').on('click', function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function (result) {
                console.log('signed in with google');
                // localStorage.setItem('user', true);
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);

                fetch('/googlesignin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        email: result.user.email
                    })
                }).then(function (res) {
                    return res.json();
                }).then(function (data) {
                    if (data.admin) {
                        location.reload();
                    }
                }); //end fetch

            })
            .catch((error) => {
                setTimeout(function () {
                    $('.errorMsg').text('There has been an error while signing in with google.');
                });
                setTimeout(function () {
                    $('.errorMsg').text('');
                }, 3000);
            });
    });

    $('#facebooksignin').on('click', function () {
        var provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with facebook');
                // localStorage.setItem('user', true);
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                setTimeout(function () {
                    $('.errorMsg').text('There has been an error while signing in with facebook.');
                });
                setTimeout(function () {
                    $('.errorMsg').text('');
                }, 3000);
            });
    });

    $('#twittersignin').on('click', function () {
        var provider = new firebase.auth.TwitterAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with twitter');
                // localStorage.setItem('user', true);
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                setTimeout(function () {
                    $('.errorMsg').text('There has been an error while signing in with twitter.');
                });
                setTimeout(function () {
                    $('.errorMsg').text('');
                }, 3000);
            });
    });

    $('#yahoosignin').on('click', function () {
        var provider = new firebase.auth.OAuthProvider('yahoo.com');
        firebase.auth().signInWithPopup(provider)
            .then(function () {
                console.log('signed in with yahoo');
                // localStorage.setItem('user', true);
                // hide auth form and show sign out button
                $('#login-btn').hide(1000);
                $('#signout').show(1000);
                $('.auth-form').hide(1000);
            })
            .catch((error) => {
                setTimeout(function () {
                    $('.errorMsg').text('There has been an error while signing in with yahoo.');
                });
                setTimeout(function () {
                    $('.errorMsg').text('');
                }, 3000);
            });
    });

    //SIGN OUT
    $('#signout').on('click', function () {
        firebase.auth().signOut()
            .then(() => {
                console.log('signed out');
                // localStorage.setItem('user', false);
                $('#login-btn').show(1000);
                $('#signout').hide(1000);
                window.location.hash = '';
                location.reload();
            })
            .catch((error) => {
                // alert('There has been an error while signing out.');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'There has been an error while signing out.',
                  });
            });
    });
});