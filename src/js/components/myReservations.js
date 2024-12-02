import {FirebaseAuth} from "../api/firebaseAuthService.js"
import {fireBaseRepository} from "../api/firebaseDataRepository.js"


/* == UI - Elements == */
const activeReservationsBtn = document.getElementById("active-reservations-btn")
const pastReservationsBtn = document.getElementById("past-reservations-btn")
const reservationsContainer = document.getElementById("reservations-container")
const messagePopupEl = document.getElementById("message-popup")
const viewReservationContainer = document.getElementById("view-reservations-section")


/* == Authentication - Object == */
const authService = new FirebaseAuth

/* == Repository - Object == */
const repository = new fireBaseRepository

/* == Global variables == */
let isForUpcomingReservations = true

/* == Listeners == */

activeReservationsBtn.addEventListener("click", async function(){
    const userReservations = await getUserActiveReservations()
    isForUpcomingReservations = true
    renderReservations(userReservations, isForUpcomingReservations)
})

pastReservationsBtn.addEventListener("click", async function(){
    const userReservations = await getUserActiveReservations()
    isForUpcomingReservations = false
    renderReservations(userReservations, isForUpcomingReservations)
})

reservationsContainer.addEventListener("click", async function(e){
    
    const reservationId = await getSelectedReservationId(e)
    const reservationData = await getSelectedReservationData(reservationId)
    console.log(reservationData)
    const messageHtml = getOwnReservationDetailsHtml(reservationData)
    showPopup(messageHtml)

    setClosePopupBtnListener ()

    document.getElementById("delete-reservation").addEventListener("click", async function(){
        messagePopupEl.innerHTML = `<div class="loader"></div>`

        await deleteReservation(reservationData)
        
        const userReservations = await getUserActiveReservations()

        showPopup(getDeleteConfirmHtml())
        setClosePopupBtnListener ()
        renderReservations(userReservations, isForUpcomingReservations)
    })
})

function setClosePopupBtnListener (){
    document.getElementById("close-btn").addEventListener("click", function(){
        hidePopup()
        
    })
}


async function getSelectedReservationData(id){
    
    const filters = [
        { field: "__name__", operator: "==", value: id }
    ]
    const document = await repository.getDocumentsByFilter("reservations", filters)
    return document.docs[0].data()
}

/* == Repository - functions == */

async function getSelectedReservationId(e){
    let id = ""
    if(e.target.tagName === "P"){
        id = e.target.parentElement.id
        const activeReservations = await getUserActiveReservations()
        return activeReservations.docs[id].id
    }else if(e.target.tagName === "DIV"){
        id = e.target.id
        const activeReservations = await getUserActiveReservations()
        return activeReservations.docs[id].id
    }
    return false

}

async function getUserActiveReservations(){
    
    const currentUserInfo = await authService.getCurrentUserInformation()
    const filter = [{field:"userId", operator: "==", value: currentUserInfo.userId}]
    const reservations = await repository.getOrderedDocumentsByFilter("reservations", filter)
    return reservations
}

async function getReservationByDivId(id){
    const activeReservations = await getUserActiveReservations()
    return activeReservations.docs[id].id
}

/* == UI functions == */


function renderReservations(userReservations, isForUpcomingReservations){
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"

    let userReservationsHtml = ``
    let idCounter = 0

    const operator = isForUpcomingReservations
        ? (a, b) => a >= b
        : (a, b) => a < b;

    userReservations.forEach((reservation)=>{
        if(operator(reservation.data().reservationDate, formattedDate)){
            userReservationsHtml += `
            <div class="reservation-preview-container" id="${idCounter}">
                <p>${formatDate(reservation.data().reservationDate)} de ${formatHours(reservation.data().firstHour)} a ${formatHours(reservation.data().secondHour)}</p>
            </div>`
        }
        idCounter++
    })
    
    reservationsContainer.innerHTML = userReservationsHtml
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
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
    return `${splitedDate[2]} de ${meses[splitedDate[1]-1]} del ${splitedDate[0]}`
}



function getOwnReservationDetailsHtml(reservationDetails){
    return `
    <div class="reservation-details">

    <h2>Detalles de su Reserva: </h2>
    <p>Estimado/a <span class="bold">${reservationDetails.userName}</span>, aquí están los detalles de su reserva:</p>
    
    
        <p><strong>Número de Casa:</strong> ${reservationDetails.houseNumber}</p>
        <p><strong>Fecha:</strong> ${reservationDetails.reservationDate}</p>
        <p><strong>Horario:</strong> de ${formatHours(reservationDetails.firstHour)} a ${formatHours(reservationDetails.secondHour)}</>
    

    <div class="pop-up-btns-container">
        <button id="close-btn" class="close-popup-btn">Cerrar</button>
        <button id="delete-reservation" class="delete-btn">Eliminar reserva</button>
    </div>
</div>
    `
}

function getDeleteConfirmHtml(){
    return `<p>
        Reserva eliminada con exito!
        </p>
        <button id="close-btn">De acuerdo!</button>
    `
}


function showPopup(popupHTML){

    messagePopupEl.innerHTML = popupHTML
    messagePopupEl.style.display = "flex"
    viewReservationContainer.classList.add("opacity")
}

function hidePopup(){
    messagePopupEl.innerHTML = ""
    messagePopupEl.style.display = "none"
    viewReservationContainer.classList.remove("opacity")
}


async function deleteReservation(reservationDetails){
    const filters = [
        { field: "reservationDate", operator: "==", value: reservationDetails.reservationDate },{field: "firstHour", operator: "==", value: reservationDetails.firstHour}
    ]

    const a = await repository.deleteDocumentByFilter("reservations",filters)
    
}