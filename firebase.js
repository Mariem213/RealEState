import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: 'AIzaSyB_At_VcjnwZ7tvCVdGLbs3kHl96byoZDM',
    authDomain: 'realestate-1de27.firebaseapp.com',
    projectId: 'realestate-1de27',
    storageBucket: 'realestate-1de27.firebasestorage.app',
    messagingSenderId: '879674771342',
    appId: '1:879674771342:web:9bff5616efac101b4f06df',
    measurementId: 'G-L9517PCL0D',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

isSupported()
    .then((yes) => {
        if (yes) getAnalytics(app)
    })
    .catch(() => { })
