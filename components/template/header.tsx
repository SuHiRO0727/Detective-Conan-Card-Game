import router from "next/router";

export default function Header() {

    const handleConfirm = () => {
        router.push('/top');
    };
    
    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <div onClick={handleConfirm} className="text-2xl font-bold">
                TCG DECK MAKER
            </div>
        </header>
    );
}