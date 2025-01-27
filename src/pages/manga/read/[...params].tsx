import ReadImages from "@/components/features/manga/Reader/ReadImages";
import Button from "@/components/shared/Button";
import Head from "@/components/shared/Head";
import Loading from "@/components/shared/Loading";
import Portal from "@/components/shared/Portal";
import { REVALIDATE_TIME } from "@/constants";
import { ReadContextProvider } from "@/contexts/ReadContext";
import { ReadSettingsContextProvider } from "@/contexts/ReadSettingsContext";
import useFetchImages from "@/hooks/useFetchImages";
import useSavedRead from "@/hooks/useSavedRead";
import useSaveRead from "@/hooks/useSaveRead";
import supabase from "@/lib/supabase";
import { Chapter, Manga } from "@/types";
import { parseNumbersFromString } from "@/utils";
import { getTitle, sortMediaUnit } from "@/utils/data";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ReadPanel = dynamic(
  () => import("@/components/features/manga/Reader/ReadPanel"),
  {
    ssr: false,
  }
);

interface ReadPageProps {
  manga: Manga;
}

const ReadPage: NextPage<ReadPageProps> = ({ manga }) => {
  const router = useRouter();
  const [showReadOverlay, setShowReadOverlay] = useState(false);
  const [declinedReread, setDeclinedReread] = useState(false);
  const saveReadTimeout = useRef<NodeJS.Timeout>();

  const saveReadMutation = useSaveRead();

  const title = useMemo(() => getTitle(manga), [manga]);

  const chapters = useMemo(() => sortMediaUnit(manga.chapters), [manga]);

  const { params } = router.query;
  const [
    mangaId,
    sourceId = chapters[0].sourceId,
    chapterId = chapters[0].sourceChapterId,
  ] = params as string[];

  const {
    data: savedReadData,
    isLoading: isSavedDataLoading,
    isError: isSavedDataError,
  } = useSavedRead(Number(mangaId));

  const currentChapter = useMemo(
    () => chapters.find((chapter) => chapter.sourceChapterId === chapterId),
    [chapters, chapterId]
  );

  const currentChapterIndex = useMemo(
    () =>
      chapters.findIndex((chapter) => chapter.sourceChapterId === chapterId),
    [chapters, chapterId]
  );

  const nextChapter = useMemo(
    () => chapters[Number(currentChapterIndex) + 1],
    [chapters, currentChapterIndex]
  );

  const readChapter = useMemo(
    () =>
      isSavedDataError
        ? null
        : chapters.find(
            (chapter) =>
              chapter.sourceChapterId === savedReadData?.chapter.sourceChapterId
          ),
    [chapters, savedReadData, isSavedDataError]
  );

  const { data, isError, error, isLoading } = useFetchImages(
    currentChapter,
    nextChapter
  );

  const handleChapterNavigate = useCallback(
    (chapter: Chapter) => {
      router.replace(
        `/manga/read/${mangaId}/${chapter.sourceId}/${chapter.sourceChapterId}`,
        null,
        {
          shallow: true,
        }
      );
    },
    [mangaId, router]
  );

  useEffect(() => {
    if (
      !readChapter ||
      isSavedDataLoading ||
      isSavedDataError ||
      declinedReread
    )
      return;

    if (currentChapter.sourceChapterId === readChapter?.sourceChapterId) {
      setDeclinedReread(true);

      return;
    }

    setShowReadOverlay(true);
  }, [
    currentChapter.sourceChapterId,
    declinedReread,
    isSavedDataError,
    isSavedDataLoading,
    readChapter,
  ]);

  useEffect(() => {
    if (saveReadTimeout.current) {
      clearTimeout(saveReadTimeout.current);
    }

    saveReadTimeout.current = setTimeout(
      () =>
        saveReadMutation.mutate({
          chapter_id: `${currentChapter.source.id}-${currentChapter.sourceChapterId}`,
          media_id: Number(mangaId),
        }),
      10000
    );

    return () => {
      clearTimeout(saveReadTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter, mangaId]);

  return (
    <ReadContextProvider
      value={{
        manga,
        currentChapter,
        currentChapterIndex,
        chapters,
        setChapter: handleChapterNavigate,
        sourceId,
      }}
    >
      <ReadSettingsContextProvider>
        <div className="flex items-center justify-center w-full min-h-screen">
          <Head
            title={`${title} (${currentChapter.name}) - Kaguya`}
            description={`Đọc truyện ${title} (${currentChapter.name}) tại Kaguya. Hoàn toàn miễn phí, không quảng cáo`}
            image={manga.bannerImage || manga.coverImage.extraLarge}
          />

          {isError ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
              <div className="space-y-4">
                <p className="text-4xl font-semibold">｡゜(｀Д´)゜｡</p>
                <p className="text-xl">
                  Đã có lỗi xảy ra ({error?.response?.data?.error})
                </p>
              </div>

              <Button primary onClick={router.back}>
                <p>Trở về trang trước</p>
              </Button>
            </div>
          ) : (
            <ReadPanel>
              {({ isSidebarOpen }) =>
                !isLoading ? (
                  <ReadImages
                    isSidebarOpen={isSidebarOpen}
                    images={data.images}
                  />
                ) : (
                  <Loading />
                )
              }
            </ReadPanel>
          )}

          {showReadOverlay && !declinedReread && (
            <Portal>
              <div
                className="fixed inset-0 z-40 bg-black/70"
                onClick={() => {
                  setShowReadOverlay(false);
                  setDeclinedReread(true);
                }}
              />

              <div className="fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 w-11/12 lg:w-2/3 p-8 rounded-md bg-background-900">
                <h1 className="text-4xl font-bold mb-4">
                  Đọc {readChapter.name}
                </h1>
                <p className="">
                  Hệ thống ghi nhận bạn đã đọc {readChapter.name}.
                </p>
                <p className="mb-4">
                  Bạn có muốn đọc {readChapter.name} không?
                </p>
                <div className="flex items-center justify-end space-x-4">
                  <Button
                    onClick={() => {
                      setShowReadOverlay(false), setDeclinedReread(true);
                    }}
                    className="!bg-transparent hover:!bg-white/20 transition duration-300"
                  >
                    <p>Không</p>
                  </Button>
                  <Button
                    onClick={() => {
                      if (!readChapter || isSavedDataLoading) return;

                      const chapter = chapters.find(
                        (chapter) =>
                          chapter.sourceChapterId ===
                          readChapter.sourceChapterId
                      );

                      handleChapterNavigate(chapter);
                    }}
                    primary
                  >
                    <p>Đọc</p>
                  </Button>
                </div>
              </div>
            </Portal>
          )}
        </div>
      </ReadSettingsContextProvider>
    </ReadContextProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { params },
}) => {
  const { data, error } = await supabase
    .from<Manga>("kaguya_manga")
    .select(
      `
        title,
        chapters:kaguya_chapters!mediaId(*, source:kaguya_sources(*)),
        bannerImage,
        coverImage,
        vietnameseTitle
      `
    )
    .eq("id", Number(params[0]))
    .single();

  if (error) {
    console.log(error);

    return { notFound: true };
  }

  return {
    props: {
      manga: data,
    },
    revalidate: REVALIDATE_TIME,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await supabase
    .from<Manga>("kaguya_manga")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(20);

  const paths = data.map((manga) => ({
    params: { params: [manga.id.toString()] },
  }));

  return { paths, fallback: "blocking" };
};

// @ts-ignore
ReadPage.getLayout = (page) => page;

export default ReadPage;
