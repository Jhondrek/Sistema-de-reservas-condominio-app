import {DataRepository} from "../dataRepository.js"
import { firestore, db, addDoc, collection, getDocs, query, where, getDoc, deleteDoc, orderBy  
} from "./firebaseConfig.js"
import {auth, onAuthStateChanged } from "../api/firebaseConfig.js"


export class fireBaseRepository extends DataRepository{
    constructor(){

        super()
        this.firestore = firestore
        this.auth = auth
        this.auth.onAuthStateChanged(user => {
            this.currentUser = user;
        });
    }

// Creates a new document in the specified collection with the provided data object.
    async addDocument(colectionName, dataObject) {
        try {
            const docRef = await addDoc(collection(db, colectionName), dataObject);
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
            console.log(e.message)
          }
    }

    async isValueInCollectionDocuments(collectionName, fieldName, searchedValue){

        const q = query(collection(db, collectionName), where(fieldName, "==", searchedValue));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.size > 0) {
            return querySnapshot;
        } else {
            return false;
        }

    }

    async getCollection(collectionName){
        try{
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot
        }catch(e){
            console.log(e.message)

        }
               
    }
//The format of the filter object is {field:name of the filed we are looking for, operator: "comparason operator for the filter", value: the value we are comparing the filter with} example: {filed:"id", operator:"==", value: 18 }
async  getDocumentsByFilter(collectionName, filters) {
    let queryRef = collection(db, collectionName);

    filters.forEach(filter => {
        queryRef = query(queryRef, where(filter.field, filter.operator, filter.value));
    });

    const querySnapshot = await getDocs(queryRef);

    if (querySnapshot.size > 0) {
        return querySnapshot;
    } else {
        return false;
    }
}

async getOrderedDocumentsByFilter(collectionName, filters) {
    let queryRef = collection(db, collectionName);

    filters.forEach(filter => {
        queryRef = query(queryRef, orderBy("reservationDate"), where(filter.field, filter.operator, filter.value));
    });

    const querySnapshot = await getDocs(queryRef);

    if (querySnapshot.size > 0) {
        return querySnapshot;
    } else {
        return false;
    }
}

async deleteDocumentByFilter(collectionName, filters){

    let queryRef = collection(db, collectionName);

    // add filters to the request
    filters.forEach(filter => {
        queryRef = query(queryRef, where(filter.field, filter.operator, filter.value));
    });

    // set the requesto to obtain the document
    const querySnapshot = await getDocs(queryRef)

    if (querySnapshot.empty) {
        console.log("No se encontró ningún documento para eliminar.");
        return false; 
    }

    // obtain the reference to the document and delete it
    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);

    console.log("Documento eliminado con éxito.");
    return true; 

}
    

}