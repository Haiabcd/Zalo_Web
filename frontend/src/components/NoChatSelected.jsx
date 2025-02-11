import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NoChat01 from "../assets/Nochat01.png";
import Nochat02 from "../assets/Nochat02.png";
import Nochat03 from "../assets/Nochat03.png";
import Nochat04 from "../assets/Nochat04.png";
import Nochat05 from "../assets/Nochat05.png";

const images = [NoChat01, Nochat02, Nochat03, Nochat04, Nochat05];

export default function NoChatSelected() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  //taildwindcss
  return (
    <div className="flex flex-col h-screen w-ful text-center pt-8 pb-8">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl mb-3">
          Chào mừng đến với{" "}
          <span className="text-[#00000] font-semibold">Zalo PC</span>!
        </h1>

        <p className="text-gray-600 text-sm mb-8">
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng <br />
          người thân, bạn bè được tối ưu hoá cho máy tính của bạn.
        </p>
      </div>

      {/* Image Container */}
      <div className="relative w-full mx-auto mb-8 h-full flex items-center justify-center">
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50"
          onClick={goToPrevious}
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <img
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={`Zalo Business Features ${currentImageIndex + 1}`}
          className="w-full max-w-[750px] h-[400px] object-contain mx-auto"
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50"
          onClick={goToNext}
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Nút tròn chuyển ảnh */}
      <div className="w-full flex justify-center space-x-1 p-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full ${
              index === currentImageIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
