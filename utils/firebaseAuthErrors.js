/** Maps Firebase Auth error codes to i18n keys (auth.firebase.*). */
export function mapFirebaseAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'auth.firebase.emailInUse'
    case 'auth/invalid-email':
      return 'auth.firebase.invalidEmail'
    case 'auth/weak-password':
      return 'auth.firebase.weakPassword'
    case 'auth/user-disabled':
      return 'auth.firebase.userDisabled'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'auth.firebase.invalidCredentials'
    case 'auth/too-many-requests':
      return 'auth.firebase.tooManyRequests'
    case 'auth/network-request-failed':
      return 'auth.firebase.network'
    default:
      return 'auth.firebase.generic'
  }
}
