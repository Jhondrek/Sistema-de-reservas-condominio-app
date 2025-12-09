import {fireBaseRepository} from "../api/firebaseDataRepository.js"
import {FirebaseAuth} from "../api/firebaseAuthService.js"

/* == URL object so we can obtain the id that was passed to us from the dashboard == */
const idTest = new URLSearchParams(window.location.search) 
const commonAreaId = idTest.get("id")

/* == Repository Object == */
const repository = new fireBaseRepository

/* == Auth Object == */
const authService = new FirebaseAuth


/* == UI - Elements == */
const reservationTimesContainer = document.getElementById("reservation-times-container")
const reservationFormEl = document.getElementById("reservation-form")
const dateEl = document.getElementById("date")
const messagePopupEl = document.getElementById("message-popup")
const mainTag = document.getElementById("main")
const hourReservationContainer = document.getElementById("hour-reservation-container")

/* == global variables == */
    let firstSelectedHour = ""
    let secondSelectedHour = ""
    let clickCounter = 0
// Stores a two-element array: the first element represents the earliest hour selected by the user, and the second represents the latest hour selected.
let currentTimeRange = []
// Its value is assigned in renderSchedulingTimes() (to show the booked dates) and in saveReservation() (to add the newly booked hours to the UI).

    let reservationsHours = []

/* == Listeners == */


dateEl.addEventListener("change", function(){
    renderSchedulingTimes()
    //If its not the first time this function is called, and we change the date we wanto to select:
    if(document.getElementById("1")){
        setHandleClickInitialState()
    }
    
})

reservationFormEl.addEventListener("submit", function(e){
    e.preventDefault()

    if(firstSelectedHour){
        const reservationConfirmationHtml = getReservationAcknowledgeHtml()

        showPopup(reservationConfirmationHtml)
    
        setClosePopupBtnListener()
    
        document.getElementById("confirm-reservation-btn").addEventListener("click", function(){
    
            saveReservation()
            handleReservationConfirmProcess()
            
        })
    }
    

})


reservationTimesContainer.addEventListener("click", function(e){
    handleClicksOnHours(e)
    
})


// reservationTimesContainer.addEventListener("mouseover", function(e){
//     // Only works while clickCounter is 1 
//     if(clickCounter === 1){
//         //Returns the id of the div of the schedule hours
//         let elementId = getSelectedTimeId(e)
//         if(elementId){
//             blockPreviousReservations()
//             colorHoursBetween(firstSelectedHour, elementId, "selected")
//         } 
//     }

    
// })

//Si cualquier numero de reservas anteriores es menor/igual al numero mayor && mayor/igual al numero menor descartar esa reserva ocupo una funcion que me diga true o false nada mas


//* == Repository functions == */



async function isDateClickedBooked(e) {
    
    const reservedHours = await getReservationHours()
    
    for(let i = 0; i< reservedHours.length; i = i+2){
            if( getSelectedTimeId(e)==reservedHours[i]|| 
                getSelectedTimeId(e)==reservedHours[i+1] ||
                (getSelectedTimeId(e)< reservedHours[i+1] && getSelectedTimeId(e)> reservedHours[i])
            ){
                return true
            }
    }
    
    return false
}

async function areClickedHoursBooked(){
    const reservedHours = await getReservationHours()

    const startHour = Math.min(firstSelectedHour, secondSelectedHour)
    const endHour = Math.max(firstSelectedHour, secondSelectedHour)

// Verifying if any of the hours from the previous reservations are in between the currently selected hours
    
    
    for(let i = 0; i<reservedHours.length; i=i+2){
        console.log("Horas de inicio"+startHour, reservedHours[i] )
        console.log("Horas de final"+endHour, reservedHours[i+1] )
        if(
            (startHour >= reservedHours[i] && startHour < reservedHours[i + 1]) || 
            (endHour > reservedHours[i] && endHour <= reservedHours[i + 1]) || 
            (startHour <= reservedHours[i] && endHour >= reservedHours[i + 1])|| startHour===reservedHours[i+1] || endHour===reservedHours[i]
        )  {
            return true
        }
    }

    return false
}

async function getClickedReservationHours(){
    const reservedHours = await getReservationHours()
    

    for(let i = 0; i< reservedHours.length; i = i+2){
        console.log(reservedHours[i])
        
        if( firstSelectedHour==reservedHours[i] || firstSelectedHour==reservedHours[i+1] || (firstSelectedHour< reservedHours[i+1] && firstSelectedHour> reservedHours[i])){
            return [reservedHours[i], reservedHours[i+1]]
        }
    }

    return false
}

async function saveReservation() {

    if(firstSelectedHour){
        const currentUserInfo = await getCurrentUserInformation()
        const userInformation = await getUserHouseNumber(currentUserInfo.userId)
        let startHour = 0
        let endHour = 0

        if(secondSelectedHour){
             startHour =Math.min(firstSelectedHour, secondSelectedHour)
             endHour = Math.max(firstSelectedHour, secondSelectedHour)
        }else{
             endHour = Number(firstSelectedHour)
             startHour = Number(firstSelectedHour)
        }
        
        const documentToAdd = {
            firstHour : startHour,
            secondHour : endHour,
            userId : userInformation.userId,
            userName : userInformation.userName,
            houseNumber: userInformation.houseNumber,
            reservationDate: dateEl.value,
            commonAreaId : commonAreaId
        }
        repository.addDocument("reservations", documentToAdd)
        reservationsHours = await getReservationHours()
        blockPreviousReservations()
        setHandleClickInitialState()
    }
    

}


async function deleteReservation(reservationDetails){
    const filters = [
        { field: "reservationDate", operator: "==", value: reservationDetails.reservationDate },{field: "firstHour", operator: "==", value: reservationDetails.firstHour}
    ]

    const a = await repository.deleteDocumentByFilter("reservations",filters)
    
}

//Returns an array of objects with the information of the reservations done in a specific date
async function getReservationsByDate(currentReservationDate) {

    const filter = [
        { field: "reservationDate", operator: "==", value: currentReservationDate },{field: "commonAreaId", operator: "==", value: commonAreaId }
    ]
    
    const reservationDocuments = await repository.getDocumentsByFilter("reservations", filter)
                        
    

    let reservationsArray = []
    //creates an array of objects with the information obtained
    if(reservationDocuments){
        reservationDocuments.forEach((document)=>{
            let earlyestDate = Math.min(document.data().firstHour, document.data().secondHour)
            let latestDate = Math.max(document.data().firstHour, document.data().secondHour)
    
            reservationsArray.push({
                firstHour : earlyestDate,
                secondHour : latestDate,
                userId : document.data().userId,
                userName : document.data().userName,
                houseNumber: document.data().houseNumber,
                reservationDate: document.data().reservationDate,
                commonAreaId: document.data().commonAreaId
            })
        })
    }

    return reservationsArray

}

async function getCurrentUserInformation(){
    const currentUserInfromation = await authService.getCurrentUserInformation()
    return currentUserInfromation
}
async function getUserHouseNumber(userId){
    const filters = [
        { field: "userId", operator: "==", value: userId }
    ];
    const extraInfoDoc = await repository.getDocumentsByFilter("extraUserInfo", filters)
    const userInformation = extraInfoDoc.docs[0].data()
    return userInformation
}

/* == UI functions == */


async function getReservationHours(){
    const reservationsForCurrentDate = await getReservationsByDate(dateEl.value)
    let hourArray = []
    reservationsForCurrentDate.forEach((reservation)=> {
        hourArray.push(reservation.firstHour)    
        hourArray.push(reservation.secondHour)    
    })
    return hourArray
}

async function renderSchedulingTimes(){
    let HtmlTimeStamps = ""
    let hourCounter = 1
    reservationsHours = await getReservationHours()
    for(let i=1; i <= 24; i++){
            HtmlTimeStamps += 
        `
            <div id="${i}">
                <p>${formatHours(hourCounter)}</p>
            </div>
        `
        hourCounter++
    }
    hourReservationContainer.style.display="block"
    reservationTimesContainer.innerHTML = HtmlTimeStamps
    blockPreviousReservations()
}

 

//The first time the user clicks defines a value in firstHourSelected
//second click, stops the "mousover" listener, and saves the secondHourSelected
//third click deleates all information from variables and counter, restarts
async function handleClicksOnHours(e){
    clickCounter++
    if(clickCounter === 1){
        firstSelectedHour = getSelectedTimeId(e)
        //if the hour selected is already booked
        document.getElementById(firstSelectedHour).classList.add("selected")
        if(await isDateClickedBooked(e)){
            const selectedReservationDetails = await fetchSelectedReservationDetails()
            //if the current user the owner of the reservation
            if(await isCurrentUserOwnerOfReservation( selectedReservationDetails.userId)){

                showPopup(getOwnReservationDetailsHtml(selectedReservationDetails))

                document.getElementById("delete-reservation").addEventListener("click", async function(){
                    await deleteReservation(selectedReservationDetails)
                    loadingPopup()
                    reservationsHours = await getReservationHours()
                    console.log(reservationsHours)
                    setHandleClickInitialState()
                    
                    showPopup(getDeleteConfirmHtml())
                    setClosePopupBtnListener ()
                    
                })

                setClosePopupBtnListener ()
                setHandleClickInitialState()
            }else{
                //show the information from the reservation
                const bookedReservationHtml = getBookedReservationHtml(selectedReservationDetails)
                showPopup(bookedReservationHtml)
                setClosePopupBtnListener ()
                setHandleClickInitialState()
            } 
        }
        
    }else if(clickCounter === 2){
        secondSelectedHour = getSelectedTimeId(e)
        currentTimeRange = getLowestAndHighestValue(firstSelectedHour, secondSelectedHour)

        if(await areClickedHoursBooked()){
            setHandleClickInitialState()
            showPopup(getRangeErrorHtml())
            setClosePopupBtnListener ()
        }else{
            blockPreviousReservations()
            colorHoursBetween(firstSelectedHour, secondSelectedHour, "selected")
        }
        
    }else{
        setHandleClickInitialState()
    }
}



async function isCurrentUserOwnerOfReservation(reservationId){
    const currentUserInfo = await getCurrentUserInformation()
    if(currentUserInfo.userId == reservationId){
        return true
    }else{
        return false
    }
}

function setHandleClickInitialState(){
        firstSelectedHour = ""
        secondSelectedHour = ""
        clickCounter = 0
        blockPreviousReservations()
        console.log("reseteado")
}

async function fetchSelectedReservationDetails(){
    const reservationHours = await getClickedReservationHours()

    const reservationFilter = [
        { field: "firstHour", operator: "==", value: reservationHours[0] }, { field: "secondHour", operator: "==", value: reservationHours[1] }
    ]
    const reservation = await repository.getDocumentsByFilter("reservations", reservationFilter)    
    
    return reservation.docs[0].data()
}





//it colors all the hour divs between the first and second hour provided
function colorHoursBetween(firstHour, secondHour=firstHour, className){
    let lowestValue = Math.min(firstHour, secondHour)
    let highestValue = Math.max(firstHour,secondHour ) 

    for(lowestValue; highestValue+1 > lowestValue;  lowestValue++){
        document.getElementById(lowestValue).classList.add(className)
    }
}




//returns the id of the div you clicked on, even if you clicked on the <p> tag
function getSelectedTimeId(e){
    if(e.target.tagName === "P"){
        return e.target.parentElement.id
    }else if(e.target.tagName === "DIV"){
        return e.target.id
    }
    return false
}

// gets rid of the selected class on all divs
function unSelectReservations(){
    for(let i=1; i <= 24; i++){
        document.getElementById(i).classList.remove("selected")
        document.getElementById(i).classList.remove("booked")
    }
}

//Takes the value stored in the global variable "reservationsHours" and colors the booked dates saved in it
async function blockPreviousReservations(){
    unSelectReservations()
    for(let i =0; i< reservationsHours.length; i = i+2){
        colorHoursBetween(reservationsHours[i], reservationsHours[i+1], "booked")
    }
}

function getLowestAndHighestValue(numberA, numberB){
    let lowestValue = Math.min(numberA, numberB)
    let highestValue = Math.max(numberA,numberB) 
    return [lowestValue, highestValue]
}

function formatHours(time){
    if(time<12){
        return `${time} am`
    }else if(time==12){
        return`12 pm`
    }else if(time ==24){
        return `12 am`
    }
    else{
        return `${time-12} pm`
    }
}


function formatDate(dateValue){
    const splitedDate = dateValue.split("-")
    const meses = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    return `${meses[splitedDate[1]-1]} ${splitedDate[2]} ${splitedDate[0]}`
}

function showPopup(popupHTML){

    messagePopupEl.innerHTML = popupHTML
    messagePopupEl.style.display = "flex"
    mainTag.classList.add("opacity")
}

function hidePopup(){
    messagePopupEl.innerHTML = ""
    messagePopupEl.style.display = "none"
    mainTag.classList.remove("opacity")
}

async function handleReservationConfirmProcess(){
    showPopup()
    loadingPopup()
    const confirmationHtml = await getReservationConfirmationHTML()
    console.log(confirmationHtml)
    messagePopupEl.innerHTML = confirmationHtml
    setClosePopupBtnListener ()
}

function loadingPopup(){
    messagePopupEl.innerHTML = `<div class="loader"></div>`
}

function setClosePopupBtnListener (){
    document.getElementById("close-btn").addEventListener("click", function(){
        hidePopup()
        setHandleClickInitialState()
    })
}

async function getReservationConfirmationHTML(){
    const currentUserInfo = await getCurrentUserInformation()
    const userInformation = await getUserHouseNumber(currentUserInfo.userId)
    
    return`
    <p>
    Hi ${userInformation.userName},<br><br>
    Your reservation has been successfully confirmed for house number ${userInformation.houseNumber}.<br><br>
    Date: <span class="bold">${formatDate(dateEl.value)}<br></span>
    Time: <span class="bold">${getHourSelectionHtml()}</span><br><br>
    </p>
    <button id="close-btn">Got it!</button>

    `
}

function getRangeErrorHtml(){
    return `<p>
    The selected time range conflicts with an existing reservation. Please choose only time slots that haven’t been booked yet (the ones not shown in gray).</p>
    <button id="close-btn">Cancel</button>
    `
}

function getReservationAcknowledgeHtml(){
    
    const htmlResponse = `
        <p>Would you like to create a reservation on ${formatDate(dateEl.value)} from ${getHourSelectionHtml()}?</p>
        <div class="button-popup-div">
            <button id="close-btn">Cancel</button> 
            <button id="confirm-reservation-btn">Confirm Reservation</button>
        </div>
    `

    return htmlResponse
}

function getHourSelectionHtml(){
    
    if(currentTimeRange[0]==currentTimeRange[1] || (firstSelectedHour && !secondSelectedHour)){
        return ` ${formatHours(firstSelectedHour)} - ${formatHours(Number(firstSelectedHour) + 1)}`
    }else{
        return ` ${formatHours(currentTimeRange[0])} - ${formatHours(currentTimeRange[1])}`
    }
}

function getBookedReservationHtml(reservationDetails){
    return `
    <p>
    Selected Reservation Details:<br><br>
    Tenant Name: <span class="bold">${reservationDetails.userName}</span>,<br><br>
    House Number: <span class="bold">${reservationDetails.houseNumber}</span>.<br><br>
    Date: <span class="bold">${formatDate(reservationDetails.reservationDate)}</span><br>
    Time: <span class="bold">from ${formatHours(reservationDetails.firstHour)} to ${formatHours(reservationDetails.secondHour)}</span><br><br>
    </p>
    <button id="close-btn">Got it!</button>

    `
}


function getOwnReservationDetailsHtml(reservationDetails){
    return `
    <div class="reservation-details">

        <h2>Your Reservation Details</h2>
        <p>Hi <span class="bold">${reservationDetails.userName}</span>, here are the details of your reservation:</p>

        <p><strong>House Number:</strong> ${reservationDetails.houseNumber}</p>
        <p><strong>Date:</strong> ${formatDate(reservationDetails.reservationDate)}</p>
        <p><strong>Time:</strong> ${getHourSelectionHtml()}</p>

        <div class="pop-up-btns-container">
            <button id="close-btn" class="close-popup-btn">Close</button>
            <button id="delete-reservation" class="delete-btn">Delete Reservation</button>
        </div>
    </div>
    `
}


function getDeleteConfirmHtml(){
    return `<p>Reservation successfully deleted!
    </p>
    <button id="close-btn">Got it!</button>
    `
}