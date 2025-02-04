import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  "https://example.com/image2.jpg",
  "https://example.com/image3.jpg",
  "https://example.com/image4.jpg",
  "https://example.com/image5.jpg"
];

export default function NoChatSelected() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">
          Chào mừng đến với <span className="text-[#0068FF]">Zalo PC</span>!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng 
          người thân, bạn bè được tối ưu hoá cho máy tính của bạn.
        </p>

        {/* Image Container */}
        <div className="relative w-full mb-8">
          <img 
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`Zalo Business Features ${currentImageIndex + 1}`}
            className="mx-auto"
          />
          
          {/* Navigation Arrows */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}