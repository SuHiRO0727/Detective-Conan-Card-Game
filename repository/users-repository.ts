import { firestore } from "@/utils/firebase-config";
import { DocumentData, deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;  // 登録日時
    updatedAt: Date;  // 更新日時
}

class UsersRepository {
    public static async createUser(user: {userId: string, username: string}): Promise<User> {
        const timestamp = serverTimestamp();  // Firestoreのサーバタイムスタンプを使用
        const userRef = doc(firestore, "users", user.userId);
        const userData = {
            username: user.username,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        await setDoc(userRef, userData);
        return {
            id: user.userId,
            username: user.username,
            email: "",  // Emailはこのメソッドでは設定不可能なため空文字列を設定
            createdAt: new Date(),  // 仮のDateオブジェクト
            updatedAt: new Date()  // 仮のDateオブジェクト
        };
    }
    
    async getUserById(userId: string): Promise<User | null> {
        const userRef = doc(firestore, "users", userId);
        const userSnap = await getDoc(userRef);
    
        if (userSnap.exists()) {
          return { id: userId, ...userSnap.data() as DocumentData } as User;
        } else {
          return null;
        }
    }
    
    async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
        const updateData = {
          ...userData,
          updatedAt: serverTimestamp()  // 更新日時だけサーバタイムスタンプを使用
        };
        const userRef = doc(firestore, "users", userId);
        await updateDoc(userRef, updateData);
    
        return this.getUserById(userId);
    }
    
    async deleteUser(userId: string): Promise<void> {
        const userRef = doc(firestore, "users", userId);
        await deleteDoc(userRef);
    }
}

export {UsersRepository}