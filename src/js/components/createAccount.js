import {FirebaseAuth} from  "../api/firebaseAuthService.js"
import {fireBaseRepository} from "../api/firebaseDataRepository.js"
/* == Auth - Object == */
const authService = new FirebaseAuth


/* == Repository - Object == */
const repository = new fireBaseRepository

/* == UI - Elements == */

const newUserForm = document.getElementById("new-user-form")
const nameEl = document.getElementById("name-el")
const houseNumber = document.getElementById("house-number")
const emailEl = document.getElementById("email-el")
const firstPassword = document.getElementById("first-password")
const secondPassword = document.getElementById("second-password")
const passwordAlert = document.getElementById("passwords-alert")
const houseNumberAlert = document.getElementById("house-Num-alert")
const emailRegisteredAlert = document.getElementById("email-registered-alert")

//global variables

const extraUserInfoRepo  = "extraUserInfo"


//* == UI - Listeners == */

firstPassword.addEventListener("input", showPasswordAlerts)
secondPassword.addEventListener("input", showPasswordAlerts)
houseNumber.addEventListener("input", showHouseNumberAlert)
newUserForm.addEventListener("submit", function(e){
    e.preventDefault()
    handleSignUpProcess()
})

emailEl.addEventListener("click", function(){
    hideElement(emailRegisteredAlert)
})
//* == Repository functions == */

async function isHouseNumberRegistered(){
     const isHouseRegistered = await repository.isValueInCollectionDocuments(extraUserInfoRepo, "houseNumber",  houseNumber.value)
     console.log(isHouseRegistered)
     return isHouseRegistered
}

async function addHouseNumber(){

    const userInfo = await authService.getCurrentUserInformation()
    console.log(userInfo)
    const documentToAdd = {
        userId : userInfo.userId,
        houseNumber : houseNumber.value,
        userName : nameEl.value
    }
    console.log(documentToAdd)
    await repository.addDocument(extraUserInfoRepo ,documentToAdd)
}


//* == UI - functions == */
async function showHouseNumberAlert(){
    if( !await isHouseNumberRegistered()){
        hideElement(houseNumberAlert)
        
    }else{
        showElement(houseNumberAlert)
    }
}

function showPasswordAlerts(){

    const firstPasswordValue = firstPassword.value
    const secondPasswordValue = secondPassword.value

    if(firstPasswordValue === "" && secondPasswordValue === ""){
        removeBorderSuccess()
        removeBorderAlert()
        hideElement(passwordAlert)
    }
    else if(firstPasswordValue === secondPasswordValue){
        removeBorderAlert()
        addBorderSuccess()
        hideElement(passwordAlert)
    }
    else if(firstPasswordValue !== secondPasswordValue && firstPasswordValue !=="" && secondPasswordValue !==""){
        removeBorderSuccess()
        addBorderAlert()
        showElement(passwordAlert)
        
        
    }
}



function showElement(element){
    element.style.display = "flex"
}

function hideElement(element){
    element.style.display = "none"

}

function removeBorderSuccess(){
    firstPassword.classList.remove("border-success")
    secondPassword.classList.remove("border-success")
}

function removeBorderAlert(){
        firstPassword.classList.remove("border-alert")
        secondPassword.classList.remove("border-alert")
}

function addBorderAlert(){
    firstPassword.classList.add("border-alert")
    secondPassword.classList.add("border-alert")
}

function addBorderSuccess(){
    firstPassword.classList.add("border-success")
    secondPassword.classList.add("border-success")
}





/* == UI - Authentication functions == */
async function handleSignUpProcess() {   
    
    if(firstPassword.value === secondPassword.value && firstPassword.value !== "" && ! await isHouseNumberRegistered()){
        try{
            //show error message if the email is already registered
            if(await authService.isUserRegistered(emailEl.value)){
                showEmailRegisteredError()
            }else{
                await signUpWithEmailPassword()
                await updateUserProfileName()
                await addHouseNumber()
                window.location.href = "dashboard.html"
            }
            
        }catch(e){ console.log(e.message)
    
        }
    }
}

function showEmailRegisteredError(){
    showElement(emailRegisteredAlert)
}

async function signUpWithEmailPassword(){
    const email = emailEl.value
    const password = firstPassword.value
    
    await authService.signUpWithEmailPassword(email, password)
}

 async function updateUserProfileName(){
    const userName = nameEl.value
     authService.updateUserProfile(userName)
}






