import { logout } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const SideMenu = () => {
    const router = useRouter();

    const handleCreateDeck = () => {
        router.push('/deck/partner');  // デッキ作成ページへのパス
    };

    const handleViewDecks = () => {
        router.push('/deck-list');  // デッキ一覧ページへのパス
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');  // ログイン画面へリダイレクト
        } catch (error) {
            console.error('Failed to logout:', error);
            alert('Logout failed');
        }
    };
    return (
        <div className="w-64 bg-gray-600 text-white flex flex-col space-y-4 p-4">
            <h2 className="text-xl font-bold mb-4">メニュー</h2>
            <button onClick={handleCreateDeck} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300">
                デッキ作成
            </button>
            <button onClick={handleViewDecks} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition duration-300">
                デッキ一覧
            </button>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300">
                ログアウト
            </button>
        </div>
    );
};

export default SideMenu