// components/LazyLoadImage.tsx

import Image from 'next/image';
import { useState } from 'react';

interface LazyLoadImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const LazyLoadImage: React.FC<LazyLoadImageProps> = ({ src, alt, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {/* Skeleton Loader */}
      {!isLoaded && (
        <div className="w-full h-full bg-gray-200 animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
        </div>
      )}

      {/* Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default LazyLoadImage;
