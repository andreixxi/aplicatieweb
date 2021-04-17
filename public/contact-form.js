const form = $('.contact-form'); // get form

var inputEmail = $('.contact-form #cemail'); // get inputs
var inputName = $('.contact-form #ctext');
var inputMessage = $('.contact-form #cmessage');

function firebaseAddForm (email, name, message) {
    db.collection("contactForms").add({
        email: email.val(),
        name: name.val(),
        message: message.val()
    })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

function sendEmail(inputEmail, inputName, inputMessage) {
    emailjs.init('user_T9Jn1YIeD2qZZS2zmpU0K');
    emailjs.send("gmail", "template_licenta", {
        from_name: inputName.val(),
        message: inputMessage.val(),
        from_email: inputEmail.val()
    }).then((result) => {
        console.log(result.text)
    }, (error) => {
        console.log(error.text);
    });
}

if (form) {
    $('#send').on('click', function (event) {
        var valid = true;
        $('.contact-form input').each(function () {
            if ($(this).val() == "") {
                valid = false;
            }
        });

        if (valid) { // all inputs have been completed
            event.preventDefault(); //prevents page refresh
            firebaseAddForm (inputEmail, inputName, inputMessage); // add to db
            sendEmail(inputEmail, inputName, inputMessage); // send content to my email
            $('.contact-form').each(function() {
                $('input').val('');
            }); //removes input 
            setTimeout(function() {
                $('.alert_msg').text('Your message has been sent');
            });
            setTimeout(function() {
                $('.alert_msg').text('');
            }, 3000);
        };
    });
}