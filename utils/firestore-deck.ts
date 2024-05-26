import { getAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase-config";


interface ImageData {
    uid: string;
    id: string;
    imageUrl: string;
    name: string;
    level: number;
    type: string;
    color: string;
    subColor: string;
    ap: number;
    lp: string;
    categories: string[];
    productName: string;
    rarity: string;
}

interface Deck {
    id?: string;
    name: string;
    partner?: ImageData;
    case?: ImageData;
    cards: ImageData[];
}

interface DeckWithId extends Deck {
    id: string;
}

const saveDeckToFirestore = async (deck: Deck) => {
    const auth = getAuth(); // ログイン中のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in");
        return;
    }

    const userDocRef = doc(firestore, "users", user.uid);
    const decksCollectionRef = collection(userDocRef, "decks");
    
    try {
        const deckDocRef = await addDoc(decksCollectionRef, {
            name: deck.name,
            partner: deck.partner || null,
            case: deck.case || null,
            deck: deck.cards,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log("Deck saved with ID: ", deckDocRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

const getDeckFromFirestore = async (deckId: string): Promise<Deck | null> => {
    const auth = getAuth(); // ログイン中のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in");
        return null;
    }

    const deckDocRef = doc(firestore, "users", user.uid, "decks", deckId);
    const deckDoc = await getDoc(deckDocRef);
    const deckData = deckDoc.data();
    return {
        id: deckDoc.id,
        name: deckData?.name || '',
        partner: deckData?.partner || undefined,
        case: deckData?.case || undefined,
        cards: deckData?.deck || [] // 修正：deckData.deck -> cards
    } as Deck;
};

const updateDeckInFirestore = async (deck: Deck, deckId: string) => {
    const auth = getAuth(); // ログイン中のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in");
        return;
    }

    if (!deck.id) {
        console.error("Deck ID is missing");
        return;
    }

    const deckDocRef = doc(firestore, "users", user.uid, "decks", deckId);
    
    try {
        await updateDoc(deckDocRef, {
            name: deck.name,
            partner: deck.partner || null,
            case: deck.case || null,
            cards: deck.cards,
            updatedAt: serverTimestamp()
        });
        console.log("Deck updated with ID: ", deckId);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
};

const deleteDeckFromFirestore = async (deckId: string) => {
    const auth = getAuth(); // ログイン中のユーザーを取得
    const user = auth.currentUser;
    if (!user) {
        console.error("User not logged in");
        return;
    }

    const deckDocRef = doc(firestore, "users", user.uid, "decks", deckId);
    
    try {
        await deleteDoc(deckDocRef);
        console.log("Deck deleted with ID: ", deckId);
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
};

export { saveDeckToFirestore, getDeckFromFirestore, updateDeckInFirestore, deleteDeckFromFirestore };