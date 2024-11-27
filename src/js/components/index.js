import {FirebaseAuth} from "../api/firebaseAuthService.js"
import {fireBaseRepository} from "../api/firebaseDataRepository.js"

const googleBtn = document.getElementById("google-btn")
const emailEl = document.getElementById("emailEl")
const passwordEl = document.getElementById("passwordEl")
const signInEmailPwBtn = document.getElementById("sing-in-email-pw-btn")
const emailAlert = document.getElementById("email-alert")
const passwordAlert = document.getElementById("password-alert")



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

/* == Sing in with Email and password == */

async function signInWithEmailAndPassword() {

    const logInErrorMessage = await authService.emailAndPasswordSignIn(emailEl.value, passwordEl.value)
    if(logInErrorMessage === "El correo electronico ingresado no ha sido registrado en la base da datos"){
        hideElement(passwordAlert)
        showElement(emailAlert)
    }else if(logInErrorMessage === "La contraseña ingresada no es valida"){
        hideElement(emailAlert)
        showElement(passwordAlert)
    }else if(logInErrorMessage === true){
        window.location.href = "./public/dashboard.html"
    }
    
}


/* == Sing in with Google == */

async function handleGoogleSignUpProcess() {   
    try{
        await signInWithGoogle()
        console.log(authService.userId)

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

function showElement(element){
    element.style.display = "flex"
}

function hideElement(element){
    element.style.display = "none"

}