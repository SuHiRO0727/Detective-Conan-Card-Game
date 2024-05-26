import Footer from "@/components/template/footer";
import Header from "@/components/template/header";
import { firestore } from "@/utils/firebase-config";
import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import html2canvas from 'html2canvas';
import DeckDetailModal from "@/components/template/deck-detail-modal";

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
    id: string;
    name: string;
    partner?: ImageData;
    case?: ImageData;
    deck: ImageData[];
    updatedAt: { seconds: number; nanoseconds: number };
}

export default function DeckList () {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null); // 追加
    const [showModal, setShowModal] = useState(false); // 追加
    const router = useRouter();
    const auth = getAuth(); // ログイン中のユーザーを取得
    const user = auth.currentUser;
    const deckRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchDecks();
        }
    }, [user]);

    const fetchDecks = async () => {
        if (!user) return;

        const decksCollectionRef = collection(firestore, "users", user.uid, "decks");
        const querySnapshot = await getDocs(decksCollectionRef);
        const loadedDecks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Deck[];
        setDecks(loadedDecks);
    };

    const handleDeleteDeck = async (deckId: string) => {
        if (!user) return;

        const deckDocRef = doc(firestore, "users", user.uid, "decks", deckId);
        await deleteDoc(deckDocRef);
        fetchDecks();
    };

    const handleViewDetails = (deck: Deck) => {
        setSelectedDeck(deck);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDeck(null);
    };

    const handleEditDeck = (deckId: string) => {
        router.push(`/deck/edit-deck?deckId=${deckId}`);
    };

    const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const getColorName = (color: string, subColor?: string) => {
        const colorMap: { [key: string]: string } = {
            blue: '青',
            green: '緑',
            white: '白',
            red: '赤',
            yellow: '黄'
        };
        const mainColor = colorMap[color] || color;
        return subColor ? `${mainColor}/${colorMap[subColor] || subColor}` : mainColor;
    };

    const downloadDeckImage = async () => {
        if (!deckRef.current) return;
        
        const canvas = await html2canvas(deckRef.current);
        const link = document.createElement('a');
        link.download = 'deck.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <>
            <Header />
            <div className="container mx-auto p-6 h-screen">
                <h2 className="text-2xl font-bold mb-4">保存したデッキ一覧</h2>
                <div className="mb-4">
                    <button
                        onClick={() => router.push('/deck/partner')}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                    >
                        新規作成
                    </button>
                </div>
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b text-center">デッキ名</th>
                            <th className="px-4 py-2 border-b text-center">パートナー名</th>
                            <th className="px-4 py-2 border-b text-center">事件</th>
                            <th className="px-4 py-2 border-b text-center">最終更新日</th>
                            <th className="px-4 py-2 border-b text-center"></th>
                            <th className="px-4 py-2 border-b text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {decks.map(deck => (
                            <tr key={deck.id}>
                                <td className="px-4 py-2 border-b text-center">{deck.name}</td>
                                <td className="px-4 py-2 border-b text-center">{deck.partner ? deck.partner.name : 'なし'}</td>
                                <td className="px-4 py-2 border-b text-center">{deck.case ? getColorName(deck.case.color, deck.case.subColor) : 'なし'}</td>
                                <td className="px-4 py-2 border-b text-center">{formatDate(deck.updatedAt)}</td>
                                <td className="px-4 py-2 border-b text-center">
                                    <button
                                        onClick={() => handleViewDetails(deck)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300"
                                    >
                                        詳細
                                    </button>
                                </td>
                                <td className="px-4 py-2 border-b text-center">
                                    <button
                                        onClick={() => handleDeleteDeck(deck.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                                    >
                                        削除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {selectedDeck && (
                    <DeckDetailModal
                        show={showModal}
                        deck={selectedDeck}
                        onClose={handleCloseModal}
                        onEdit={() => handleEditDeck(selectedDeck.id)}
                    />
                )}
            </div>
            <Footer />
        </>
    );
}