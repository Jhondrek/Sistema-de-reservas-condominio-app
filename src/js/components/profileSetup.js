import {FirebaseAuth} from "../api/firebaseAuthService.js"
import {fireBaseRepository} from "../api/firebaseDataRepository.js"

const newUserForm = document.getElementById("new-user-form")
const nameEl = document.getElementById("name-el")
const houseNumber = document.getElementById("house-number")
const houseNumberAlert = document.getElementById("house-Num-alert")

/* == Global - Const == */

const extraUserInfoRepo  = "extraUserInfo"


/* == Auth - Object == */
const authService = new FirebaseAuth

/* == Repository - Object == */
const repository = new fireBaseRepository

/* == UI - Listeners == */
houseNumber.addEventListener("input", showHouseNumberAlert)

newUserForm.addEventListener("submit", function(e){
    e.preventDefault()
    handleSignUpProcess()
})

//* == Repository functions == */
async function isHouseNumberRegistered(){
    const isHouseRegistered = await repository.isValueInCollectionDocuments(extraUserInfoRepo, "houseNumber",  houseNumber.value)
    return isHouseRegistered
}

async function addHouseNumber(){

    const userInfo = await authService.getCurrentUserInformation()
    console.log(userInfo)
    const documentToAdd = {
        userId : userInfo.userId,
        houseNumber : houseNumber.value
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

function showElement(element){
    element.style.display = "flex"
}

function hideElement(element){
    element.style.display = "none"

}

/* == Authentication functions == */

async function updateUserProfileName(){
    const userName = nameEl.value
    await authService.updateUserProfile(userName)
}


async function handleSignUpProcess() {   
    
    if( ! await isHouseNumberRegistered()){
        try{
            await updateUserProfileName()
            await addHouseNumber()
            window.location.href = "dashboard.html"
        }catch(e){ console.log(e.message)
    
        }
    }

    
}


