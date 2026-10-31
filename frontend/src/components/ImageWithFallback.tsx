import React, { useState } from "react";
import { AGRICULTURAL_IMAGES, type AgriImageItem } from "../data/agriculturalImages";
import { Image as ImageIcon } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageKey?: string;
  fallbackSrc?: string;
  showCaption?: boolean;
  showCredit?: boolean;
  aspectRatioClass?: string;
  containerClassName?: string;
  language?: "en" | "ta" | "hi";
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  imageKey,
  src,
  alt,
  fallbackSrc,
  showCaption = false,
  showCredit = false,
  aspectRatioClass = "aspect-video",
  containerClassName = "",
  className = "",
  language = "en",
  ...rest
}) => {
  const item: AgriImageItem | undefined = imageKey ? AGRICULTURAL_IMAGES[imageKey] : undefined;

  const resolvedSrc = src || (item ? item.url : "");
  const defaultFallback = item ? item.fallbackSvg : fallbackSrc || "";
  const resolvedAlt = alt || (item ? (language === "ta" ? item.altTa : item.alt) : "Agricultural photograph");

  const [currentSrc, setCurrentSrc] = useState<string>(resolvedSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && defaultFallback) {
      setHasError(true);
      setCurrentSrc(defaultFallback);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl group ${aspectRatioClass} ${containerClassName}`}>
      {/* Skeleton Loading State */}
      {isLoading && (
        <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center bg-paper z-10">
          <ImageIcon className="w-8 h-8 text-forest-2/30 animate-pulse" />
        </div>
      )}

      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={resolvedAlt}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        {...rest}
      />

      {/* Fallback Badge Overlay when offline/fallback is active */}
      {hasError && (
        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-forest/90 text-lime text-[10px] font-bold border border-lime/30 backdrop-blur-xs flex items-center gap-1 shadow-sm">
          <span>🌿 Botanical Reference</span>
        </div>
      )}

      {/* Credit Badge Overlay if requested */}
      {showCredit && item && (
        <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-md bg-black/75 text-white/90 text-[9px] font-medium backdrop-blur-xs border border-white/15">
          {item.credit}
        </div>
      )}

      {/* Optional Caption Overlay */}
      {showCaption && item && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-white">
          <p className="text-xs font-bold leading-tight line-clamp-1">
            {language === "ta" ? item.titleTa : item.title}
          </p>
          <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
            {language === "ta" ? item.descriptionTa : item.description}
          </p>
        </div>
      )}
    </div>
  );
};
