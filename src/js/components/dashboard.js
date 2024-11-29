import {FirebaseAuth} from "../api/firebaseAuthService.js"
import {fireBaseRepository} from "../api/firebaseDataRepository.js"


/* == UI - Elements == */
const logOutEl = document.getElementById("log-out-el")
const commonAreasSection = document.getElementById("common-areas-section")
const welcomeMessage = document.getElementById("welcome-message")

/* == Authentication - Object == */
const authService = new FirebaseAuth

/* == Repository - Object == */
const repository = new fireBaseRepository

/* == Initial render of common areas == */
renderCommonAreas()


logOutEl.addEventListener("click", function(){
    authService.singOut()
    window.location.href = "../index.html"})



async function renderCommonAreas(){
    const commonAreasSnapshot = await repository.getCollection("CommonAreas")
    commonAreasSnapshot.forEach(commonArea => {
        commonAreasSection.appendChild(createCommonArea(commonArea))
    })
}

function createCommonArea(wholeDoc){
    //creating the common area div
    const commonAreaDiv = document.createElement("div")
    commonAreaDiv.classList.add("area-comun")
    //creating the common area img
    const commonAreaImg = document.createElement("img")
    commonAreaImg.src = wholeDoc.data().img
    //creating the common area tittle
    const commonAreaTittle = document.createElement("h2")
    commonAreaTittle.textContent = wholeDoc.data().name
    
    commonAreaDiv.appendChild(commonAreaImg)
    commonAreaDiv.appendChild(commonAreaTittle)

    
    commonAreaDiv.addEventListener("click", function(){
        window.location.href = `schedule.html?id=${wholeDoc.id}`
    })

    return commonAreaDiv
}
renderWelcomeMessage()
async function renderWelcomeMessage(){
    const userInformation = await authService.getCurrentUserInformation()
    const userExtraInformation = await repository.getDocumentsByFilter("extraUserInfo",[{field: "userId", operator: "==", value: userInformation.userId}])
    welcomeMessage.textContent = `Bienvenido ${userExtraInformation.docs[0].data().userName}!`
}
