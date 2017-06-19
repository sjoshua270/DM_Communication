document.addEventListener('DOMContentLoaded', function () {
    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});
let isDM = false;
const database = firebase.database();
let rollsRef;
let rolls = {};
let roomCode;

let firebaseAuthContainer = $('#firebaseui-auth-container');
let signInStatus = $('#sign-in-status');
let signOutButton = $('#sign-out');
let dmQuestionWrapper = $('#dm_q_wrapper');
let submissionWrapper = $('#submissions');

// FirebaseUI config.
let uiConfig = {
    signInSuccessUrl: 'lanaholics.servegame.com:4818',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

// Initialize the FirebaseUI Widget using Firebase.
let ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

initApp = function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            let displayName = user.displayName;
            // let email = user.email;
            // let emailVerified = user.emailVerified;
            // let photoURL = user.photoURL;
            // let phoneNumber = user.phoneNumber;
            // let providerData = user.providerData;
            user.getToken().then(function (accessToken) {
                signInStatus.html(displayName);
                signOutButton.html('Sign out');
            });
            signOutButton.css('display', 'block');
            getUserInfo(user.uid);
            askIfDM();
        } else {
            // User is signed out.
            signInStatus.html('Signed out');
            signOutButton.css('display', 'none');
        }
    }, function (error) {
        console.log(error);
    });
};

window.addEventListener('load', function () {
    initApp()
});

function getUserInfo(userID) {

}

function signOut() {
    firebase.auth().signOut().then(function () {
        openSignIn();
    }).catch(function (error) {
        console.error(error);
    });
}

function askIfDM() {
    firebaseAuthContainer.css('display', 'none');
    dmQuestionWrapper.css('display', 'block');
}

function openSignIn() {
    submissionWrapper.css('display', 'none');
    dmQuestionWrapper.css('display', 'none');
    firebaseAuthContainer.css('display', 'block');
}

function switchViews(tf) {
    isDM = tf;
    if (isDM) {
        $('#room_code_input').val(Math.floor(1000 + Math.random() * 9000));
        enterRoom();
    } else {
        document.getElementById('room_code_input_wrapper').style.display = 'block';
    }
    dmQuestionWrapper.css('display', 'none');
}

function enterRoom() {
    const roomCodeInput = $('#room_code_input');
    roomCode = roomCodeInput.val();
    if (roomCode % 1 === 0) {
        rollsRef = database.ref('rolls/' + roomCode);

        if (isDM) {
            rollsRef.on('child_added', function (data) {
                rolls[data.key] = [data.val().name, data.val().roll];
                updateRolls();
            });

            rollsRef.on('child_changed', function (data) {
                rolls[data.key] = [data.val().name, data.val().roll];
                updateRolls();
            });

            rollsRef.on('child_removed', function (data) {
                delete rolls[data.key];
                updateRolls();
            });
            document.getElementById('roll_values').style.display = 'block';
        }
        $('#room_code').html("Rm: " + roomCode);
        $('#room_code_input_wrapper').css('display', 'none');
        submissionWrapper.css('display', 'block');
    } else {
        alert("Room number must be an integer (e.g. 1234)")
    }
}

function updateRolls() {
    // Create items array
    let items = Object.keys(rolls).map(function (key) {
        return [key, rolls[key]];
    });

    // Sort the array based on the second element
    items.sort(function (a, b) {
        return b[1][1] - a[1][1];
    });

    document.getElementById('roll_values').innerHTML = "";
    let ul = document.getElementById('roll_values');
    for (let i = 0; i < items.length; i++) {
        let li = document.createElement('li');
        li.innerHTML = '<li class="mdl-list__item mdl-list__item--two-line">' +
            '<span class="mdl-list__item-primary-content" style="text-align: left">' +
            '<i class="material-icons mdl-list__item-avatar">person</i>' +
            '<span>' + items[i][1][0] + '</span>' +
            '<br>' +
            '<span style="font-size: 0.8em">' + items[i][1][1] + '</span>' +
            '</span>' +
            '<span class="mdl-list__item-secondary-content">' +
            '<button class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" ' +
            'onclick="removeValue(\'' + items[i][0] + '\')" ' +
            'style="float: right;">' +
            '<i class="material-icons">remove_circle</i>' +
            '</button>' +
            '</span>' +
            '</li>';
        ul.appendChild(li);

    }
}

function writeValue() {
    let name = $('#name').val();
    let roll = $('#roll').val();
    rollsRef.push().set({
        name: name,
        roll: roll
    });
}

function removeValue(key) {
    rollsRef.child(key).remove();
}