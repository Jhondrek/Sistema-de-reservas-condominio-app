import { AuthService } from "../auth.js"

  import{ auth,
          createUserWithEmailAndPassword,
          onAuthStateChanged,
          updateProfile,
          provider,
          signInWithPopup,
          signOut,
          fetchSignInMethodsForEmail,
          signInWithEmailAndPassword,
          getAuth,
          sendPasswordResetEmail 
  } from "../api/firebaseConfig.js"

// this.auth = getAuth()
      // this.auth.onAuthStateChanged(user => {
      //     this.currentUser = user;

      //     if(this.currentUser.uid){
      //       this.userId = this.currentUser.uid
      //     }

      // });

export class FirebaseAuth extends AuthService {

   constructor(){
      super()
      this.auth = getAuth()
      //This allows us to use "await" in certain functions that need the user to be initialized in orted to work
      this.userInitialized = new Promise((resolve) => {
        onAuthStateChanged(this.auth, (user) => {
          if (user) {
            this.user = user;
            this.userId = user.uid;
          } else {
            this.user = null;
          }
          resolve(); // Resuelve la promesa una vez que se ha determinado el estado del usuario
        });
      });
      
  }


  
  async getCurrentUserInformation(){
    
    await this.userInitialized;

    if (this.user) {
      const displayName = this.user.displayName;
      const email = this.user.email;
      const photoURL = this.user.photoURL;
      const emailVerified = this.user.emailVerified;
      const uid = this.user.uid;

      return {
        userName:displayName,
        userEmail:email,
        userPicture: photoURL,
        userEmail: emailVerified,
        userId:uid
      }

    }
}

  signUpWithEmailPassword(email, password){

      return createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {

          const user = userCredential.user;
          console.log(user + " creado exitosamente")
      })
      .catch((e) => {
          console.log(e.message) 
      });
  }

  updateUserProfile(fullName){
    updateProfile(this.user, {
      displayName: fullName
    }).then(() => {
      console.log("Profile updated!")
    }).catch((e) => {
      console.log(e.message)
    });
  }

  

  // updateProfile(this.currentUser, {
  //   displayName: fullName
  // }).then(() => {
  //   console.log("name updated now your name is :" + this.currentUser.displayName)
  //   console.log(this.currentUser)
  // }).catch((e) => {
  //   console.log(e.message)
  // });

  async signInWithGoogle(){
      await signInWithPopup(this.auth, provider)
      .then((result) => {
        console.log(result)

      }).catch((e) => {
        console.log(e.message)
      })
  }

  async singOut(){

    signOut(auth).then(() => {
      console.log("Sesion cerrada exitosamente")
    }).catch((e) => {
      console.log(e.message)
    });
  }



  async isUserRegistered(email) {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      console.log(signInMethods)
      if (signInMethods.length === 0) {
            return false
      } else {
            return signInMethods
      }
    } catch (error) {
      console.error("Error fetching sign-in methods:", error.message);
    }
  }

  async emailAndPasswordSignIn(email, password){

    try{
      await signInWithEmailAndPassword(this.auth, email, password)
      return true
    }catch(e){
      console.log(e.message)
      if(e.message === "Firebase: Error (auth/user-not-found)."){
        return "El correo electronico ingresado no ha sido registrado en la base da datos"
      }else if(e.message === "Firebase: Error (auth/wrong-password)."){
        return "La contraseña ingresada no es valida"
      }
    }

  }

  sendPasswordResetEmail(email){
    sendPasswordResetEmail(this.auth, email)
    .then(() => {
      console.log(true)
    })
    .catch((e) => {
      console.log(e.message)
    });
  } 


}