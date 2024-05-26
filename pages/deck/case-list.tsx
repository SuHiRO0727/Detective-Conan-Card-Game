import Footer from "@/components/template/footer";
import Header from "@/components/template/header";
import { firestore } from "@/utils/firebase-config";
import { productOptions } from "@/utils/options";
import { sortImages } from "@/utils/sortUtils";
import { collection, getDocs, query } from "firebase/firestore";
import { useRouter } from "next/router"
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

export default function CaseList () {
    const router = useRouter()
    const [searchName, setSearchName] = useState('');
    const [searchColor, setSearchColor] = useState('');
    const [searchSubColor, setSearchSubColor] = useState('');
    const [searchProductName, setSearchProductName] = useState('');
    const [images, setImages] = useState<ImageData[]>([]);
    const [filteredImages, setFilteredImages] = useState<ImageData[]>(images);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    
    useEffect(() => {
        const fetchCards = async () => {
            const q = query(collection(firestore, "cards"));
            const querySnapshot = await getDocs(q);
            const loadedImages = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }) as ImageData);

            // ケースのカードのみをフィルタリング
            const caseImages = loadedImages.filter(image => image.type === 'case');
            const sortedImages = sortImages(caseImages);
            setImages(sortedImages);
            setFilteredImages(sortedImages);
        };

        fetchCards();
    }, []);

    const filterImages = () => {
        const results = images.filter((image) => {
            return (
                (searchName === '' || image.name.includes(searchName)) &&
                (searchColor === '' || image.color === searchColor) &&
                (searchSubColor === '' || image.subColor === searchSubColor) &&
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

    const handleConfirm = () => {
        if (selectedImage) {
            localStorage.setItem('case', JSON.stringify(selectedImage));
            setSelectedImage(null);
            router.push('/deck/card-list');
        }
    };

    return (
        <>
            <Header />
            <div className="flex w-full h-screen bg-gray-100">
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
                            <label className="block text-gray-700">色2</label>
                            <select
                                className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                                onChange={(e) => setSearchSubColor(e.target.value)}
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
                                    className={`border-2 rounded shadow-md cursor-pointer hover:shadow-lg transition duration-300 ${
                                        image.type === 'case' ? 'h-auto w-full max-w-none object-contain' : 'h-full w-auto object-cover'
                                    }`}
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
                        <h2 className="text-xl font-bold mb-4">これにしますか？</h2>
                        <div className="flex justify-around">
                            <button
                                onClick={handleConfirm}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                            >
                                はい
                            </button>
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                            >
                                いいえ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}