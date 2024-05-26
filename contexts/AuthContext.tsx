// firebase-auth-context.tsx
import { useRouter } from 'next/router'
import { getAuth } from '@firebase/auth'
import { createContext, useEffect, useState, useContext } from 'react'
import { AuthContextState, ReactNodeProps } from '../types/Admin'
import { EmailAuthProvider, User, createUserWithEmailAndPassword, reauthenticateWithCredential, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth, getFirebaseApp } from '@/utils/firebase-config'

// Create a context for Firebase authentication.
const FirebaseAuthContext = createContext<AuthContextState | null>(null);

const FirebaseAuthProvider = ({ children }: ReactNodeProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();

    const firebaseApp = getFirebaseApp();
    const auth = getAuth(firebaseApp);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged (
            async (firebaseUser) => {
                const currentPath = window.location.pathname
                const skipPath = ['/', '/password-reset', '/register'];

                if(skipPath.includes(currentPath)) {
                    return;
                };

                if(firebaseUser) {
                    setCurrentUser(firebaseUser);
                } else {
                    const currentPath = window.location.pathname;

                    if(
                        currentPath !== '/' &&
                        currentPath !== '/password-reset' &&
                        currentPath !== '/register'
                    ) {
                        router.push('/');
                    };

                    setCurrentUser(null);
                };
            },
            (error) => {
              console.error('Auth state changed error:', error)
            },
        )
        return () => unsubscribe();
    }, [auth, router]);

    // Render the context provider with the current user state, making it available to all child components.
    return (
        <FirebaseAuthContext.Provider value={{ currentUser: currentUser }}>
            {children}
        </FirebaseAuthContext.Provider>
    );
}

export const createUser = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        return userCredential.user
    } catch(error) {
        if (error instanceof FirebaseError) {
            throw error;
        } else {
            throw new Error('アカウント作成中にエラーが発生しました。');
        }
    }
}

export const login = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        return userCredential.user
    } catch (error) {
        if (error instanceof FirebaseError) {
            throw error;
        } else {
            throw new Error('ログイン処理中にエラーが発生しました。');
        }
    }
}

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        if (error instanceof FirebaseError) {
            throw error;
        } else {
            throw new Error('ログアウト処理中にエラーが発生しました。');
        }
    }
}

export async function reauthenticate(email: string, password: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        console.error('再認証失敗: ユーザーがログインしていません。');
        return false;
    }
    const credential = EmailAuthProvider.credential(email, password);

    try {
        await reauthenticateWithCredential(user, credential);
        return true;
    } catch (error) {
        console.error('再認証失敗:', error);
        return false;
    }
}

export { FirebaseAuthContext, FirebaseAuthProvider }

// Custom hook to use Firebase authentication context easily in other components.
export const useFirebaseAuth = () => useContext(FirebaseAuthContext)