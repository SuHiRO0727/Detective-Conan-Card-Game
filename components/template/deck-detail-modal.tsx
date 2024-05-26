import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';

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

interface DeckDetailModalProps {
    show: boolean;
    deck: Deck; // デッキの型を適切に指定
    onClose: () => void;
    onEdit: () => void;
}

const DeckDetailModal: React.FC<DeckDetailModalProps> = ({ show, deck, onClose, onEdit }) => {
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<string | null>(null);

    const handleShare = async () => {
        if (ref.current) {
            const canvas = await html2canvas(ref.current, {
                useCORS: true,
                logging: true // デバッグ用にログを有効にする
            });
            const dataUrl = canvas.toDataURL("image/png");
            setImage(dataUrl);
        }
    };

    

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full" ref={ref}>
                <h2 className="text-2xl font-bold mb-4">デッキ詳細</h2>
                <div className="flex">
                    <div className="w-1/4">
                        <h3 className="text-lg font-semibold mb-2">パートナー</h3>
                        <div className="border-2 rounded p-2 mb-4 flex items-center justify-center">
                            {deck.partner ? (
                                <img
                                    src={deck.partner.imageUrl}
                                    alt={deck.partner.name}
                                    className="h-[250px] w-auto border-2 rounded shadow-md"
                                />
                            ) : (
                                <div className="h-[250px] w-auto border-2 rounded shadow-md flex items-center justify-center">
                                    <span>なし</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">事件</h3>
                        <div className="border-2 rounded p-2 flex items-center justify-center">
                            {deck.case ? (
                                <img
                                    src={deck.case.imageUrl}
                                    alt={deck.case.name}
                                    className="h-[150px] w-auto border-2 rounded shadow-md object-cover"
                                />
                            ) : (
                                <div className="h-[150px] w-auto border-2 rounded shadow-md flex items-center justify-center">
                                    <span>なし</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-3/4">
                        <h3 className="text-lg font-semibold mb-2">デッキ</h3>
                        <div className="flex flex-wrap mb-4 max-h-[80vh] overflow-y-auto">
                            {deck.deck.map((card, index) => (
                                <div key={index} className="w-[9.5%] p-0.5">
                                    <img
                                        src={card.imageUrl}
                                        alt={card.name}
                                        className="h-[100px] w-full border-2 rounded shadow-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* {image && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">生成された画像</h3>
                        <img src={image} alt="Deck Image" />
                    </div>
                )} */}
                <div className="flex justify-around mt-4">
                    {/* <button
                        onClick={onEdit}
                        className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-300"
                    >
                        編集
                    </button>
                    <button
                        onClick={handleShare}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                    >
                        画像を共有
                    </button> */}
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeckDetailModal;