import DeckConfirmationModal from "@/components/template/deck-confirmation-modal";
import Footer from "@/components/template/footer";
import Header from "@/components/template/header";
import { firestore } from "@/utils/firebase-config";
import { saveDeckToFirestore } from "@/utils/firestore-deck";
import { numberOptions, productOptions } from "@/utils/options";
import { sortImages } from "@/utils/sortUtils";
import { collection, getDocs, query } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    name: string;
    partner?: ImageData;
    case?: ImageData;
    cards: ImageData[];
}

const getLocalStorageItem = (key: string) => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const setLocalStorageItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
};

const removeLocalStorageItem = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

export default function CardList() {
    const router = useRouter();
    const [searchName, setSearchName] = useState('');
    const [searchColor, setSearchColor] = useState('');
    const [searchLevels, setSearchLevels] = useState<number[]>([]);
    const [searchType, setSearchType] = useState('');
    const [searchApMin, setSearchApMin] = useState<number | null>(null);
    const [searchApMax, setSearchApMax] = useState<number | null>(null);
    const [searchLp, setSearchLp] = useState('');
    const [searchProductName, setSearchProductName] = useState('');
    const [images, setImages] = useState<ImageData[]>([]);
    const [filteredImages, setFilteredImages] = useState<ImageData[]>(images);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [showDeckModal, setShowDeckModal] = useState(false);
    const [cardCounts, setCardCounts] = useState<{ [key: string]: number }>({});
    const [deck, setDeck] = useState<Deck>({
        name: '',
        partner: undefined,
        case: undefined,
        cards: [],
    });

    useEffect(() => {
        const fetchCards = async () => {
            const q = query(collection(firestore, "cards"));
            const querySnapshot = await getDocs(q);
            const loadedImages = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data(),
                level: Number(doc.data().level),
                ap: Number(doc.data().ap)
            }) as ImageData);

            const filteredImages = loadedImages.filter(image => image.type === 'character' || image.type === 'event');
            const sortedImages = sortImages(filteredImages);
            setImages(sortedImages);
            setFilteredImages(sortedImages);
        };

        fetchCards();
    }, []);

    useEffect(() => {
        const savedCounts = getLocalStorageItem('cardCounts');
        if (savedCounts) {
            setCardCounts(JSON.parse(savedCounts));
        }
    }, []);

    useEffect(() => {
        const partner = getLocalStorageItem('partner');
        const caseCard = getLocalStorageItem('case');
        const cards = getLocalStorageItem('cards');
        if (partner || caseCard || cards) {
            setDeck({
                name: '',
                partner: partner ? JSON.parse(partner) : undefined,
                case: caseCard ? JSON.parse(caseCard) : undefined,
                cards: cards ? JSON.parse(cards) : [],
            });
        }
    }, []);

    const handleLevelChange = (level: number) => {
        setSearchLevels(prevLevels =>
            prevLevels.includes(level)
                ? prevLevels.filter(l => l !== level)
                : [...prevLevels, level]
        );
    };

    const filterImages = () => {
        const results = images.filter((image) => {
            return (
                (searchName === '' || image.name.includes(searchName)) &&
                (searchColor === '' || image.color === searchColor) &&
                (searchLevels.length === 0 || searchLevels.includes(image.level)) &&
                (searchType === '' || image.type.includes(searchType)) &&
                (searchApMin === null || image.ap >= searchApMin) &&
                (searchApMax === null || image.ap <= searchApMax) &&
                (searchLp === '' || image.lp === searchLp) &&
                (searchProductName === '' || image.productName.includes(searchProductName))
            );
        });
        setFilteredImages(sortImages(results));
    };

    const openModal = (image: ImageData) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const incrementCount = (card: ImageData) => {
        setCardCounts(prevCounts => {
            const newCount = (prevCounts[card.uid] || 0) + 1;
            if (newCount <= 3) {
                const newCounts = { ...prevCounts, [card.uid]: newCount };
                updateLocalStorage(newCounts);
                return newCounts;
            }
            return prevCounts;
        });
    };

    const decrementCount = (card: ImageData) => {
        setCardCounts(prevCounts => {
            const newCount = (prevCounts[card.uid] || 0) - 1;
            if (newCount >= 0) {
                const newCounts = { ...prevCounts, [card.uid]: newCount };
                updateLocalStorage(newCounts);
                return newCounts;
            }
            return prevCounts;
        });
    };

    const updateLocalStorage = (newCounts: { [key: string]: number }) => {
        setLocalStorageItem('cardCounts', JSON.stringify(newCounts));
        const updatedCards = Object.entries(newCounts)
            .flatMap(([uid, count]) =>
                Array(count).fill(images.find(card => card.uid === uid))
            )
            .filter(Boolean) as ImageData[];
        setDeck({ ...deck, cards: updatedCards });
        setLocalStorageItem('cards', JSON.stringify(updatedCards));
    };

    const handleDeckButtonClick = () => {
        setShowDeckModal(true);
    };

    const handleCloseDeckModal = () => {
        setShowDeckModal(false);
    };

    const handleDeckNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeck({ ...deck, name: e.target.value });
    };

    const handleSaveDeck = async () => {
        await saveDeckToFirestore(deck);
        console.log('デッキを保存:', deck);
        localStorage.clear();
        router.push('/top');
    };

    return (
        <>
            <Header />
            <div className="flex w-full h-screen bg-gray-100">
                <button
                    onClick={handleDeckButtonClick}
                    className="absolute top-4 right-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                    デッキ確認
                </button>
                <div className="w-1/4 bg-white p-6 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">検索</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-700">カード名</label>
                            <input
                                type="text"
                                placeholder="カード名を入力"
                                className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">色</label>
                            <select
                                className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                onChange={(e) => setSearchColor(e.target.value)}
                            >
                                <option value="">選択してください</option>
                                <option value="blue">青</option>
                                <option value="green">緑</option>
                                <option value="white">白</option>
                                <option value="red">赤</option>
                                <option value="yellow">黄</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700">レベル</label>
                            <div className="flex flex-wrap">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                                    <div key={level} className="mr-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id={`level-${level}`}
                                            value={level}
                                            onChange={() => handleLevelChange(level)}
                                            checked={searchLevels.includes(level)}
                                            className="mr-1"
                                        />
                                        <label htmlFor={`level-${level}`} className="text-gray-700">{level}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700">タイプ</label>
                            <select
                                className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            >
                                <option value="">選択してください</option>
                                <option value="character">キャラクター</option>
                                <option value="event">イベント</option>
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <div className="w-1/2">
                                <label className="block text-gray-700">AP 最小値</label>
                                <input
                                    type="number"
                                    placeholder="最小APを入力"
                                    className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                    value={searchApMin !== null ? searchApMin : ''}
                                    onChange={(e) => setSearchApMin(e.target.value !== '' ? Number(e.target.value) : null)}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-700">AP 最大値</label>
                                <input
                                    type="number"
                                    placeholder="最大APを入力"
                                    className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                    value={searchApMax !== null ? searchApMax : ''}
                                    onChange={(e) => setSearchApMax(e.target.value !== '' ? Number(e.target.value) : null)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700">LP</label>
                            <select
                                className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                value={searchLp || ''}
                                onChange={(e) => setSearchLp(e.target.value)}
                            >
                                <option value="">選択してください</option>
                                {numberOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700">商品名</label>
                            <select
                                className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                value={searchProductName}
                                onChange={(e) => setSearchProductName(e.target.value)}
                            >
                                {productOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
                            onClick={filterImages}
                        >
                            検索
                        </button>
                    </form>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">カード一覧</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredImages.map((image) => (
                            <div key={image.uid} className="flex justify-center">
                                <img
                                    onClick={() => openModal(image)}
                                    src={image.imageUrl}
                                    alt={image.name}
                                    className="h-[300px] w-auto border-2 rounded shadow-md cursor-pointer hover:shadow-lg transition duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />

            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.name}
                            className="w-full h-auto mb-4"
                        />
                        <div className="flex justify-around items-center my-4">
                            <button
                                onClick={() => decrementCount(selectedImage)}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                            >
                                -
                            </button>
                            <span className="text-xl mx-4">{cardCounts[selectedImage.uid] || 0}枚</span>
                            <button
                                onClick={() => incrementCount(selectedImage)}
                                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex justify-around">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <DeckConfirmationModal
                deck={deck}
                show={showDeckModal}
                onClose={handleCloseDeckModal}
                onSave={handleSaveDeck}
                onNameChange={handleDeckNameChange}
                onIncrement={incrementCount}
                onDecrement={decrementCount}
                onCardClick={openModal}
            />
        </>
    );
}