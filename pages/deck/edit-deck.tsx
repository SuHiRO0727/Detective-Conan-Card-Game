import Footer from "@/components/template/footer";
import Header from "@/components/template/header";
import { firestore } from "@/utils/firebase-config";
import { getDeckFromFirestore } from "@/utils/firestore-deck";
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

export default function EditDeck () {
    const router = useRouter();

    // urlからデッキID取得
    const { deckId } = router.query;

    // 名前検索
    const [searchName, setSearchName] = useState('');
    // 色検索
    const [searchColor, setSearchColor] = useState('');
    // レベル検索
    const [searchLevels, setSearchLevels] = useState<number[]>([]);
    // タイプ検索
    const [searchType, setSearchType] = useState('');
    // AP検索
    const [searchApMin, setSearchApMin] = useState<number | null>(null); // AP最小値
    const [searchApMax, setSearchApMax] = useState<number | null>(null); // AP最大値
    // LP検索
    const [searchLp, setSearchLp] = useState('');
    // 商品名検索
    const [searchProductName, setSearchProductName] = useState('');


    const [images, setImages] = useState<ImageData[]>([]);
    const [filteredImages, setFilteredImages] = useState<ImageData[]>(images);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [cardCounts, setCardCounts] = useState<{ [key: string]: number }>(JSON.parse(localStorage.getItem('cardCounts') || '{}'));
    const [showDeckModal, setShowDeckModal] = useState(false);
    const [deck, setDeck] = useState<{ name: string; partner?: ImageData; case?: ImageData; cards: ImageData[] }>({
        name: '',
        partner: JSON.parse(localStorage.getItem('partner') || 'null') || undefined,
        case: JSON.parse(localStorage.getItem('case') || 'null') || undefined,
        cards: JSON.parse(localStorage.getItem('cards') || '[]') || [], // 初期化時に空配列にする
    });

    useEffect(() => {
        if (deckId) {
            // デッキIDをstringに宣言
            fetchDeck(deckId as string);
        }
    }, [deckId]);

    // デッキ情報を取得
    const fetchDeck = async (deckId: string) => {
        const fetchedDeck = await getDeckFromFirestore(deckId);
        console.log(fetchedDeck)
        // if (fetchedDeck) {
        //     setDeck({
        //         name: fetchedDeck.name,
        //         partner: fetchedDeck.partner,
        //         case: fetchedDeck.case,
        //         cards: fetchedDeck.cards
        //     });
        //     localStorage.setItem('partner', JSON.stringify(fetchedDeck.partner || null));
        //     localStorage.setItem('case', JSON.stringify(fetchedDeck.case || null));
        //     localStorage.setItem('cards', JSON.stringify(fetchedDeck.cards || []));
        // }
    };

    // キャラとイベントに絞った全カードを取得
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

    // レベルの検索機能
    const handleLevelChange = (level: number) => {
        setSearchLevels(prevLevels =>
            prevLevels.includes(level)
                ? prevLevels.filter(l => l !== level)
                : [...prevLevels, level]
        );
    };

    // 検索処理
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

    // モーダルの＋ボタン
    const incrementCount = (card: ImageData) => {
        setCardCounts(prevCounts => {
            // 現在の枚数に1を加算
            const newCount = (prevCounts[card.uid] || 0) + 1;
            // 現在の枚数が3以下の場合
            if (newCount <= 3) {
                // 新しい枚数を反映したオブジェクト
                const newCounts = { ...prevCounts, [card.uid]: newCount };
                updateLocalStorage(newCounts);
                return newCounts;
            }
            return prevCounts;
        });
    };

    // モーダルの-ボタン
    const decrementCount = (card: ImageData) => {
        setCardCounts(prevCounts => {
            // 現在の枚数から1を減算
            const newCount = (prevCounts[card.uid] || 0) - 1;
            // 現在の枚数が0以上の場合
            if (newCount >= 0) {
                // 新しい枚数を反映したオブジェクト
                const newCounts = { ...prevCounts, [card.uid]: newCount };
                updateLocalStorage(newCounts);
                return newCounts;
            }
            return prevCounts;
        });
    };

    // 
    const updateLocalStorage = (newCounts: { [key: string]: number }) => {
        // 新しいカード枚数の情報をローカルストレージに保存
        localStorage.setItem('cardCounts', JSON.stringify(newCounts));
        const updatedCards = Object.entries(newCounts)
            .flatMap(([uid, count]) =>
                Array(count).fill(images.find(card => card.uid === uid))
            )
            .filter(Boolean) as ImageData[];
        setDeck({ ...deck, cards: updatedCards });
        localStorage.setItem('cards', JSON.stringify(updatedCards));
    };

    // カードクリック時モーダルopen
    const openModal = (image: ImageData) => {
        setSelectedImage(image);
    };

    // カードクリック時モーダルclose
    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <Header />
            <div className="flex w-full h-screen bg-gray-100">
                {/* <button
                    onClick={handleDeckButtonClick}
                    className="absolute top-4 right-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                    デッキ確認
                </button> */}
                {/* 左側: カードの絞り込みフォーム */}
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
                {/* 右側: カード一覧 */}
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

            {/* モーダル */}
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
            {/* デッキ確認モーダル */}
            {/* <DeckConfirmationModal
                deck={deck}
                show={showDeckModal}
                onClose={handleCloseDeckModal}
                onSave={handleSaveDeck}
                onNameChange={handleDeckNameChange}
                onIncrement={incrementCount}
                onDecrement={decrementCount}
                onCardClick={openModal}
            /> */}
        </>
    );

}