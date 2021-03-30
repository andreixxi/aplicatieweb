var firebaseConfig = {
    apiKey: "AIzaSyCyA_1qg5KW4DyIzaHuF6IMXlJg9WbNVfk",
    authDomain: "web-app-for-3d-model.firebaseapp.com",
    projectId: "web-app-for-3d-model",
    storageBucket: "web-app-for-3d-model.appspot.com",
    messagingSenderId: "636171680645",
    appId: "1:636171680645:web:276e7106d1742b80c322ec",
    measurementId: "G-LCV9LML3HJ"
};
 
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore(); // firestore instance

