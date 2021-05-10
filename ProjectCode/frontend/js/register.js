const userid = document.getElementById("username")
const password = document.getElementById("password")
const confirm = document.getElementById("confirmpw")
const loginScreen = document.getElementById("loginScreen")
const registerButton = document.getElementById("registerButton")

registerButton.addEventListener('click', registerFunction)

function registerFunction(){ 
    if(userid.value=='' || password.value==''||confirm.value==''){
        return alert("All fields are required!");
    }
    if (password.value != confirm.value) {
        return alert("Passwords don't match");
    };
    //check valid username and password
    const regex = "^[a-zA-Z0-9_]+$";
    if(!userid.value.match(regex) || !password.value.match(regex)){
        return alert("Username and Password can only contain letters, numbers, or underscore");
    };

    const registerData = {
        username: userid.value,
        password: password.value,
    };

    fetch('https://demo-io.herokuapp.com/register', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.msg) { //success
            alert(result.msg);
            window.location.replace("../pages/login.html");
        }
        else{
            alert(result);
        };
    })
    .catch(error => {
        console.error('Error', error)
    })
}
