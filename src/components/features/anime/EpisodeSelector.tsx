import ArrowSwiper, {
  SwiperProps,
  SwiperSlide,
} from "@/components/shared/ArrowSwiper";
import useDevice from "@/hooks/useDevice";
import { Episode } from "@/types";
import { chunk } from "@/utils";
import classNames from "classnames";
import Link, { LinkProps } from "next/link";
import React, { useMemo } from "react";

export interface EpisodeSelectorProps {
  episodes: Episode[];
  activeEpisode?: Episode;
  chunkSwiperProps?: SwiperProps;
  episodeLinkProps?: Omit<LinkProps, "href">;
}

const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  episodes,
  activeEpisode,
  chunkSwiperProps,
  episodeLinkProps,
}) => {
  const { isMobile } = useDevice();

  const chunks = useMemo(
    () => chunk(episodes, isMobile ? 6 : 18),
    [episodes, isMobile]
  );

  const [activeTabIndex, setActiveTabIndex] = React.useState(() => {
    const index = chunks.findIndex((chunk) =>
      chunk.some(
        (episode) => episode.sourceEpisodeId === activeEpisode?.sourceEpisodeId
      )
    );

    return index === -1 ? 0 : index;
  });

  const realActiveTabIndex = useMemo(
    () => (activeTabIndex > chunks.length - 1 ? 0 : activeTabIndex),
    [activeTabIndex, chunks.length]
  );

  return (
    <React.Fragment>
      <ArrowSwiper
        isOverflowHidden={false}
        className="w-11/12 mx-auto"
        defaultActiveSlide={realActiveTabIndex}
        {...chunkSwiperProps}
      >
        {chunks.map((chunk, i) => {
          const firstEpisodeName = chunk[0].name.replace("Tập", "");
          const lastEpisodeName = chunk[chunk.length - 1].name.replace(
            "Tập",
            ""
          );

          const title =
            chunk.length === 1
              ? `${firstEpisodeName}`
              : `${firstEpisodeName} - ${lastEpisodeName}`;

          return (
            <SwiperSlide onClick={() => setActiveTabIndex(i)} key={i}>
              <div
                className={classNames(
                  "text-gray-300 cursor-pointer mx-auto rounded-[18px] px-2 py-1 w-[max-content] duration-300 transition",
                  realActiveTabIndex === i
                    ? "bg-white text-black"
                    : "hover:text-white"
                )}
              >
                {title}
              </div>
            </SwiperSlide>
          );
        })}
      </ArrowSwiper>

      <div className="mt-10 grid xl:grid-cols-8 lg:grid-cols-7 md:grid-cols-6 sm:grid-cols-5 grid-cols-4 gap-4">
        {chunks[realActiveTabIndex].map((episode) => (
          <Link
            href={`/anime/watch/${episode.mediaId}/${episode.sourceId}/${episode.sourceEpisodeId}`}
            key={episode.sourceEpisodeId}
            shallow
            {...episodeLinkProps}
          >
            <a
              className={classNames(
                "rounded-md bg-background-800 col-span-1 aspect-w-2 aspect-h-1 group",
                episode.sourceEpisodeId === activeEpisode?.sourceEpisodeId &&
                  "text-primary-300"
              )}
            >
              <div className="flex items-center justify-center w-full h-full group-hover:bg-white/10 rounded-md transition duration-300">
                <p>{episode.name}</p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </React.Fragment>
  );
};

export default React.memo(EpisodeSelector);
