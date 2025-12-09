import {FirebaseAuth} from "../api/firebaseAuthService.js"
import {fireBaseRepository} from "../api/firebaseDataRepository.js"

const googleBtn = document.getElementById("google-btn")
const emailEl = document.getElementById("emailEl")
const passwordEl = document.getElementById("passwordEl")
const signInEmailPwBtn = document.getElementById("sing-in-email-pw-btn")
const emailAlert = document.getElementById("email-alert")
const passwordAlert = document.getElementById("password-alert")
const forgotPasswordEl = document.getElementById("forgot-password")


/* == Auth - Object == */
const authService = new FirebaseAuth

/* == Repository - Object == */
const repository = new fireBaseRepository

/* == Global - Const == */
const extraUserInfoRepo  = "extraUserInfo"

/* == Listeners == */

googleBtn.addEventListener("click", function(){
    handleGoogleSignUpProcess()
})

signInEmailPwBtn.addEventListener("click", function(){
    signInWithEmailAndPassword()

})

forgotPasswordEl.addEventListener("click", function(){
    handleForgotPasswordRequest()
})

/* == Sing in with Email and password == */

async function signInWithEmailAndPassword() {

    const logInErrorMessage = await authService.emailAndPasswordSignIn(
        emailEl.value, 
        passwordEl.value
    )

    if (logInErrorMessage === "The email address you entered is not registered in the database.") {
        hideElement(passwordAlert)
        showElement(emailAlert)

    } else if (logInErrorMessage === "The password you entered is not valid.") {
        hideElement(emailAlert)
        showElement(passwordAlert)

    } else if (logInErrorMessage === true) {
        window.location.href = "./public/dashboard.html"
    }
}



/* == Sing in with Google == */

async function handleGoogleSignUpProcess() {   
    try{
        await signInWithGoogle()
        
        renderLoadingAnimation()
        const wasUserRegistedBefore = await wasUserRegisteredBefore(authService.userId)
        
        if(wasUserRegistedBefore){
            window.location.href = "./public/dashboard.html"
        }else{
            window.location.href = "./public/profileSetup.html"
        }

    }catch(e){ 
        console.log(e.message)
    }
}

async function wasUserRegisteredBefore(uid) {
    console.log("aaa")
    const hasUserRegisteredAHouse = await repository.isValueInCollectionDocuments(extraUserInfoRepo, "userId", uid)

    console.log(hasUserRegisteredAHouse)
    return hasUserRegisteredAHouse
}

async function signInWithGoogle() {
    await authService.signInWithGoogle()
}



/* == UI functions == */
function handleForgotPasswordRequest() {
    if (emailEl.value) {
        authService.sendPasswordResetEmail(emailEl.value)
        alert("Please check your email to reset your password.")
    } else {
        alert("Please enter your email address before requesting a password reset.")
    }
}

function showElement(element){
    element.style.display = "flex"
}

function hideElement(element){
    element.style.display = "none"

}

function renderLoadingAnimation(){
    const bodyElement = document.getElementById("body-content")
    Array.from(bodyElement.children).forEach(child => {
        child.style.display = "none";
    })
    const loaderDiv = document.getElementById("loader")
    console.log(loaderDiv)
    loaderDiv.style.display = "flex"
}


