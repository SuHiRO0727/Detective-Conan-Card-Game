import { FC } from 'react';

// AuthContextからlogout関数をインポートする想定
import Slider from '@/components/template/slider';
import Header from '@/components/template/header';
import Footer from '@/components/template/footer';
import SideMenu from '@/components/template/side-menu';

const TopPage: FC = () => {

    return (
        <>
            <Header />
            <div className="flex h-screen bg-gray-100">
                <SideMenu />
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="h-1/2 mb-4">
                        <Slider />
                    </div>
                    <div className="h-1/2 bg-white shadow-md rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-center mb-6">フリースペース</h2>
                        <p className="text-center">ここに自由にコンテンツを追加できます。</p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TopPage;