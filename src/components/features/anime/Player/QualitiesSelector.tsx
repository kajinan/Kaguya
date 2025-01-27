import { useVideoState } from "@/contexts/VideoStateContext";
import React from "react";
import { FiSettings } from "react-icons/fi";
import { FcCheckmark } from "react-icons/fc";
import Popup from "@/components/shared/Popup";
import ControlsIcon from "@/components/features/anime/Player/ControlsIcon";

const qualityTypes = [
  {
    type: "SD",
    quality: "480p",
  },
  {
    type: "HD",
    quality: "720p",
  },
  {
    type: "FHD",
    quality: "1080p",
  },
];

const QualitiesSelector = () => {
  const { state, setState } = useVideoState();

  const handleQualityChange = (qualitiy: string) => () => {
    setState((prev) => ({ ...prev, currentQuality: qualitiy }));
  };

  return state?.qualities.length ? (
    <Popup
      portalSelector=".video-wrapper"
      reference={<ControlsIcon whileTap={{ rotate: 360 }} Icon={FiSettings} />}
      referenceClassName="h-8"
      placement="top"
      offset={[0, 15]}
      showArrow
      type="click"
      className="!p-0 w-40 !py-4 text-center"
    >
      <p className="mb-8">Chất lượng</p>

      <ul className="space-y-2">
        {state?.qualities.map((quality) => {
          const qualType = qualityTypes.find(
            (qual) => quality === qual.quality
          );

          return (
            <li
              className="w-full flex items-center justify-center relative cursor-pointer py-2 hover:bg-white/20 transition duration-300 text-white"
              onClick={handleQualityChange(quality)}
              key={quality}
            >
              {state.currentQuality === quality && (
                <FcCheckmark className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-5" />
              )}

              <p className="relative w-min">
                {quality}
                {qualType && (
                  <p className="absolute text-primary-500 -top-2 -right-5 text-sm">
                    {qualType.type}
                  </p>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </Popup>
  ) : null;
};

export default React.memo(QualitiesSelector);
