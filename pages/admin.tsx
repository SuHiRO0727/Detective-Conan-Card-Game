import Footer from "@/components/template/footer";
import Header from "@/components/template/header";
import { firestore } from "@/utils/firebase-config";
import { cardTypes, categoryOptions, colorOptions, numberOptions, productOptions, rarityOptions, subColorOptions } from "@/utils/options";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

interface AdminProps {
    id: string;
    name: string;
    type: string;
    color: string;
    subColor?: string;
    category?: string[];
    rarity: string;
    level?: number;
    ap?: number;
    lp?: number;
    productName: string;
    imageUrl: string;
}

export default function Admin(props: AdminProps) {
    const [formData, setFormData] = useState<AdminProps>({
        id: props.id || '',
        name: props.name || '',
        type: props.type || 'partner',
        color: props.color || 'blue', // 例えばここに 'blue' などのデフォルト値を設定可能
        subColor: props.subColor || '',
        category: props.category || [],
        rarity: props.rarity || 'C',
        level: props.level || 1, // 0 よりも 1 などの適切なデフォルト値を設定
        ap: props.ap || 0,
        lp: props.lp || 1,
        productName: props.productName || 'CT-P01',
        imageUrl: props.imageUrl || ''
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // ディープコピーを作成し、元のデータを変更しないようにします。
        let dataToSubmit = { ...formData };

        // タイプに基づいて不要なフィールドを除外
        switch (dataToSubmit.type) {
            case 'partner':
                delete dataToSubmit.subColor;
                delete dataToSubmit.category;
                delete dataToSubmit.level;
                delete dataToSubmit.ap;
                break;
            case 'character':
                delete dataToSubmit.subColor;
                break;
            case 'event':
                delete dataToSubmit.subColor;
                delete dataToSubmit.category;
                delete dataToSubmit.ap;
                delete dataToSubmit.lp;
                break;
            case 'case':
                delete dataToSubmit.category;
                delete dataToSubmit.level;
                delete dataToSubmit.ap;
                delete dataToSubmit.lp;
                break;
        }

        try {
            // Firestoreの`cards`コレクションにデータを追加
            const docRef = await addDoc(collection(firestore, "cards"), {
                ...dataToSubmit,
                createdAt: serverTimestamp() // Firestoreのサーバー時刻を使用
            });
            console.log("Document written with ID: ", docRef.id);
            alert('データを登録しました');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert('データの登録に失敗しました');
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = event.target;
        console.log(`Field: ${name}, Value: ${value}`);
        if (type === 'checkbox') {
            const isChecked = (event.target as HTMLInputElement).checked;
            setFormData(prevState => ({
                ...prevState,
                category: isChecked
                    ? [...(prevState.category || []), value]
                    : prevState.category?.filter(cat => cat !== value)
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    return (
        <>
            <Header />
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID:</label>
                            <input type="text" name="id" value={formData.id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type:</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                { cardTypes.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color:</label>
                            <select name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                { colorOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Sub Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sub Color:</label>
                            <select name="subColor" value={formData.subColor || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                { subColorOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category:</label>
                            <div className="grid grid-cols-3 gap-4">
                                {categoryOptions.map(category => (
                                    <div key={category} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="category"
                                            value={category}
                                            checked={formData.category?.includes(category)}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">{category}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Rarity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rarity:</label>
                            <select name="rarity" value={formData.rarity} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                { rarityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level:</label>
                            <select name="level" value={formData.level} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                            </select>
                        </div>
                        {/* AP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">AP:</label>
                            <input type="number" name="ap" value={formData.ap} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        {/* LP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LP:</label>
                            <select name="lp" value={formData.lp} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                {Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name:</label>
                            <select name="productName" value={formData.productName} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                { productOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL:</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        {/* Submit Button */}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                登録
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
}