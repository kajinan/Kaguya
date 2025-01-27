import { useReadInfo } from "@/contexts/ReadContext";
import { useReadSettings } from "@/contexts/ReadSettingsContext";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { ImageSource } from "@/types";
import { serialize } from "@/utils";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsFillImageFill } from "react-icons/bs";

interface ReadImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  onVisible?: () => void;
  image: ImageSource;
}

const ReadImage: React.FC<ReadImageProps> = ({
  image,
  className,
  onLoad,
  onVisible,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const { currentChapter } = useReadInfo();
  const { fitMode } = useReadSettings();
  const ref = useRef<HTMLImageElement>(null);

  const entry = useIntersectionObserver(ref, {
    rootMargin: "0px 0px 10px 0px",
  });

  useEffect(() => {
    setLoaded(false);
  }, [image]);

  useEffect(() => {
    if (!entry?.isIntersecting) return;
    if (!ref.current) return;
    if (!ref.current.complete) return;

    onVisible?.();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.isIntersecting]);

  const src = useMemo(
    () =>
      image.useProxy
        ? `/api/proxy?url=${encodeURIComponent(image.image)}&source_id=${
            currentChapter.sourceId
          } `
        : image.image,
    [currentChapter.sourceId, image.image, image.useProxy]
  );

  // I have to use img instead of Next/Image because I want to image calculate the height itself
  return (
    <React.Fragment>
      {!loaded && (
        <div className="flex items-center justify-center w-full h-60 text-gray-500">
          <BsFillImageFill className="w-8 h-8 animate-pulse" />
        </div>
      )}

      <motion.div
        animate={loaded ? "animate" : "initial"}
        initial="initial"
        exit="exit"
        variants={{
          animate: { opacity: 1, display: "block" },
          initial: { opacity: 0, display: "none" },
        }}
      >
        {/* eslint-disable-next-line */}
        <img
          ref={ref}
          className={classNames(
            fitMode === "auto" && "w-auto h-auto",
            fitMode === "width" && "w-full h-auto",
            fitMode === "height" && "w-auto h-screen",
            className
          )}
          alt="Đọc truyện tại Kaguya"
          src={src}
          onLoad={(e) => {
            setLoaded(true);

            onLoad?.(e);
          }}
          onError={() => {
            setLoaded(true);
          }}
          {...props}
        />
      </motion.div>
    </React.Fragment>
  );
};

export default React.memo(ReadImage);
