const loginB= document.getElementById('loginButton');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');

loginB.addEventListener('click', onClickLogin);

function onClickLogin(){
    const loginData = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    fetch('https://demo-io.herokuapp.com/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(result =>{
        if (result.token) {//login success
            const userdata = parseJwt(result.token);

            sessionStorage.token = result.token;
            sessionStorage.username = userdata.username;
            sessionStorage.score = userdata.score

            //switch to initialScreen
            window.location.replace("../pages/index.html");
        } else {
            alert(result);
            usernameInput.value = "";
            passwordInput.value = "";
        };
    })
    .catch(error=>{
        console.error('Error:', error)
    });
};

//if already logged in, redirect
function checkIfLogin() { //when load <body>
    if (sessionStorage.token){
        fetch('https://demo-io.herokuapp.com//checkLogin', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: sessionStorage.token })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {//check login success, redirect
                window.location.replace("../pages/index.html");
            };
        })
        .catch(error => {
            console.error('Error:', error)
        });
    };
}



//Helper for decode jwt
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};