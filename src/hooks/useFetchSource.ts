import { Episode, VideoSource } from "@/types";
import axios, { AxiosError } from "axios";
import { useQuery, useQueryClient } from "react-query";

interface ReturnSuccessType {
  success: true;
  sources: VideoSource[];
}

interface ReturnFailType {
  success: false;
  error: string;
  errorMessage: string;
}

const convertSources = (sources: VideoSource[], sourceId: string) =>
  sources.map((source) => {
    if (source.useProxy) {
      source.file = `/api/proxy?url=${encodeURIComponent(
        source.file
      )}&source_id=${sourceId}`;
    }

    return source;
  });

export const useFetchSource = (
  currentEpisode: Episode,
  nextEpisode?: Episode
) => {
  const queryClient = useQueryClient();

  const fetchSource = (episode: Episode) =>
    axios
      .get<ReturnSuccessType>(`/api/anime/source`, {
        params: {
          episode_id: episode.sourceEpisodeId,
          source_media_id: episode.sourceMediaId,
          source_id: episode.sourceId,
        },
      })
      .then(({ data }) => {
        data.sources = convertSources(data.sources, episode.sourceId);

        return data;
      });

  const getQueryKey = (episode: Episode) =>
    `source-${episode.sourceId}-${episode.sourceEpisodeId}`;

  return useQuery<ReturnSuccessType, AxiosError<ReturnFailType>>(
    getQueryKey(currentEpisode),
    () => fetchSource(currentEpisode),
    {
      onSuccess: () => {
        if (!nextEpisode?.sourceEpisodeId) return;

        queryClient.prefetchQuery(getQueryKey(nextEpisode), () =>
          fetchSource(nextEpisode)
        );
      },
    }
  );
};
