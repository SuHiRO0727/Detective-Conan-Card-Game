import { User } from "firebase/auth"

/**
 * @see {@link https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser}<br>
 */
export type AuthContextState = {
    currentUser: User | null | undefined
  }
  export type ReactNodeProps = {
    children?: React.ReactNode
  }
  