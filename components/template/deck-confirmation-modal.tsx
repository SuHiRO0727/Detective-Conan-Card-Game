// template/deck-confirmation-modal.tsx
import React, { useState } from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

interface DeckConfirmationModalProps {
    deck: { name: string; partner?: ImageData; case?: ImageData; cards: ImageData[] };
    show: boolean;
    onClose: () => void;
    onSave: () => void;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onIncrement?: (card: ImageData) => void;
    onDecrement?: (card: ImageData) => void;
    onCardClick?: (card: ImageData) => void;
}

const DeckConfirmationModal: React.FC<DeckConfirmationModalProps> = ({ deck, show, onClose, onSave, onNameChange, onIncrement, onDecrement, onCardClick }) => {
    const [selectedCard, setSelectedCard] = useState<ImageData | null>(null);
    if (!show) return null;

    const characterCardsCount = deck.cards.filter(card => card.type === 'character').length;
    const eventCardsCount = deck.cards.filter(card => card.type === 'event').length;
    const isDeckOverLimit = deck.cards.length > 40;

    // コスト帯のデータを収集
    const costData: { [key: number]: number } = {};
    deck.cards.forEach(card => {
        const cost = card.level; // ここでは level をコストとして使用しています。適宜変更してください。
        costData[cost] = (costData[cost] || 0) + 1;
    });

    const costLabels = Object.keys(costData).sort((a, b) => Number(a) - Number(b));
    const costValues = costLabels.map(label => costData[Number(label)]);

    const data = {
        labels: costLabels,
        datasets: [
            {
                label: 'コスト帯',
                data: costValues,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                precision: 0,
                title: {
                    display: true,
                    text: '枚数'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'コスト'
                }
            }
        }
    };

    const handleCardClick = (card: ImageData) => {
        setSelectedCard(card);
    };

    const closeCardModal = () => {
        setSelectedCard(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full max-h-screen overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">デッキ確認</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">デッキ名</label>
                    <input
                        type="text"
                        placeholder="デッキ名を入力"
                        className="w-full border-2 rounded p-2 focus:outline-none focus:border-blue-500"
                        value={deck.name}
                        onChange={onNameChange}
                    />
                </div>
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <p>デッキの枚数: <span className={isDeckOverLimit ? 'text-red-500' : ''}>{deck.cards.length}</span>/40</p>
                        <p>キャラカードの枚数: {characterCardsCount}</p>
                        <p>イベントカードの枚数: {eventCardsCount}</p>
                    </div>
                    <div className="w-1/3">
                        <Bar data={data} options={options} />
                    </div>
                </div>
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
                        <div className="flex flex-wrap">
                            {deck.cards.length > 0 ? (
                                deck.cards.map((card, index) => (
                                    <div key={index} className="flex-none w-1/10 p-0.5" onClick={() => handleCardClick(card)}>
                                        <img
                                            src={card.imageUrl}
                                            alt={card.name}
                                            className="h-[100px] w-auto border-2 rounded shadow-md cursor-pointer"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center">
                                    <span>なし</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-around mt-4">
                    <button
                        onClick={onSave}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
                    >
                        保存
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                    >
                        閉じる
                    </button>
                </div>
            </div>
            {selectedCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <img
                            src={selectedCard.imageUrl}
                            alt={selectedCard.name}
                            className="w-full h-auto mb-4"
                        />
                        <div className="flex justify-around items-center my-4">
                            {onDecrement && (
                                <button
                                    onClick={() => onDecrement(selectedCard)}
                                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                                >
                                    -
                                </button>
                            )}
                            <span className="text-xl mx-4">{deck.cards.filter(card => card.uid === selectedCard.uid).length}枚</span>
                            {onIncrement && (
                                <button
                                    onClick={() => onIncrement(selectedCard)}
                                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
                                >
                                    +
                                </button>
                            )}
                        </div>
                        <div className="flex justify-around">
                            <button
                                onClick={closeCardModal}
                                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeckConfirmationModal;