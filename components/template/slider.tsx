import { FC, useState } from 'react';
import Image from 'next/image';

const Slider: FC = () => {
    const slides = [
        '/images/slider1.jpeg',
        '/images/slider2.jpg',
        '/images/slider3.webp'
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative w-full h-full overflow-hidden rounded-lg shadow-md">
            <div className="flex transition-transform duration-500 ease-in-out transform" style={{ translate: `-${currentSlide * 100}%` }}>
                {slides.map((slide, index) => (
                    <Image
                        key={index}
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        width={1200}
                        height={800}
                        className="w-full h-full object-cover"
                    />
                ))}
            </div>
            <button
                onClick={prevSlide}
                className="absolute top-1/2 transform -translate-y-1/2 left-0 bg-gray-700 bg-opacity-50 text-white p-2 rounded-full m-2"
            >
                &lt;
            </button>
            <button
                onClick={nextSlide}
                className="absolute top-1/2 transform -translate-y-1/2 right-0 bg-gray-700 bg-opacity-50 text-white p-2 rounded-full m-2"
            >
                &gt;
            </button>
        </div>
    );
};

export default Slider;