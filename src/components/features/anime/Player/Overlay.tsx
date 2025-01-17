import ForwardIcon from "@/components/icons/ForwardIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import RewindIcon from "@/components/icons/RewindIcon";
import { useVideo } from "@/contexts/VideoContext";
import { useVideoState } from "@/contexts/VideoStateContext";
import useDevice from "@/hooks/useDevice";
import classNames from "classnames";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import React, { useCallback } from "react";
import { AiOutlineLoading3Quarters, AiOutlinePause } from "react-icons/ai";
import ControlsIcon from "@/components/features/anime/Player/ControlsIcon";
import QualitiesSelector from "@/components/features/anime/Player/QualitiesSelector";

const variants = { show: { opacity: 1 }, hide: { opacity: 0 } };

interface OverlayProps {
  showControls: boolean;
}

const Overlay: React.FC<OverlayProps & HTMLMotionProps<"div">> = ({
  className,
  showControls,
  ...props
}) => {
  const { state, videoEl } = useVideo();
  const { isMobile } = useDevice();

  const handleOverlayClick = () => {
    if (isMobile) return;

    if (videoEl.paused) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  };

  const seek = useCallback(
    (time: number) => () => {
      if (!videoEl) return;

      videoEl.currentTime = videoEl.currentTime + time;
    },
    [videoEl]
  );

  const handlePlay = () => videoEl.play();

  const handlePause = () => videoEl.pause();

  return (
    <AnimatePresence exitBeforeEnter>
      {showControls && (
        <motion.div
          variants={variants}
          initial="hide"
          animate="show"
          exit="hide"
          className={classNames(
            "absolute inset-0 w-full z-30",
            isMobile && "bg-black/70",
            className
          )}
          onClick={handleOverlayClick}
          {...props}
        >
          <div className="video-overlay w-full h-full flex items-center justify-center">
            {isMobile && (
              <motion.div
                variants={variants}
                initial="hide"
                animate="show"
                exit="hide"
                className="flex items-center justify-between w-2/3"
              >
                <ControlsIcon
                  width="3rem"
                  height="3rem"
                  Icon={RewindIcon}
                  onClick={seek(-10)}
                  whileTap={{ rotate: -20 }}
                />

                {state.buffering ? (
                  <ControlsIcon
                    Icon={AiOutlineLoading3Quarters}
                    className="animate-spin"
                    width="3.5rem"
                    height="3.5rem"
                  />
                ) : state.paused ? (
                  <ControlsIcon
                    width="3.5rem"
                    height="3.5rem"
                    Icon={PlayIcon}
                    onClick={handlePlay}
                  />
                ) : (
                  <ControlsIcon
                    width="3rem"
                    height="3rem"
                    Icon={AiOutlinePause}
                    onClick={handlePause}
                  />
                )}

                <ControlsIcon
                  width="3rem"
                  height="3rem"
                  Icon={ForwardIcon}
                  onClick={seek(10)}
                  whileTap={{ rotate: 20 }}
                />
              </motion.div>
            )}
          </div>

          {isMobile && (
            <div className="absolute top-10 right-10">
              <QualitiesSelector />
            </div>
          )}

          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Overlay;
