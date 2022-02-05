import CommentsSection from "@/components/features/comment/CommentsSection";
import Button from "@/components/shared/Button";
import CharacterConnectionCard from "@/components/shared/CharacterConnectionCard";
import CircleButton from "@/components/shared/CircleButton";
import DetailsBanner from "@/components/shared/DetailsBanner";
import DetailsSection from "@/components/shared/DetailsSection";
import DotList from "@/components/shared/DotList";
import Head from "@/components/shared/Head";
import InfoItem from "@/components/shared/InfoItem";
import List from "@/components/shared/List";
import NotificationButton from "@/components/shared/NotificationButton";
import PlainCard from "@/components/shared/PlainCard";
import SourceStatus from "@/components/shared/SourceStatus";
import { REVALIDATE_TIME } from "@/constants";
import { useUser } from "@/contexts/AuthContext";
import supabase from "@/lib/supabase";
import { Comment, Manga } from "@/types";
import { numberWithCommas, parseNumbersFromString } from "@/utils";
import { convert, getTitle } from "@/utils/data";
import { motion } from "framer-motion";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp, BsFillPlayFill } from "react-icons/bs";

interface DetailsPageProps {
  manga: Manga;
}

const DetailsPage: NextPage<DetailsPageProps> = ({ manga }) => {
  const user = useUser();

  const [isChapterExpanded, setIsChapterExpanded] = useState(false);

  const chapters = useMemo(
    () =>
      manga.chapters
        .sort(
          (a, b) =>
            parseNumbersFromString(a.name)[0] -
            parseNumbersFromString(b.name)[0]
        )
        .reverse(),
    [manga]
  );

  const title = useMemo(() => getTitle(manga), [manga]);

  return (
    <>
      <Head
        title={`${title} - Kaguya`}
        description={manga.description}
        image={manga.banner_image}
      />

      <div className="pb-8">
        <DetailsBanner image={manga.banner_image} />

        <div className="relative px-4 sm:px-12 z-10 bg-background-900 pb-4">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="shrink-0 relative left-1/2 -translate-x-1/2 md:static md:left-0 md:-translate-x-0 w-[186px] -mt-20 space-y-6">
              <PlainCard src={manga.cover_image.extra_large} alt={title} />

              {user && (
                <div className="flex items-center space-x-1">
                  <SourceStatus type="manga" source={manga} />
                  <NotificationButton type="manga" source={manga} />
                </div>
              )}
            </div>

            <div className="justify-between text-center md:text-left flex flex-col items-center md:items-start py-4 mt-4 md:-mt-16">
              <Link href={`/manga/read/${manga.ani_id}`}>
                <a>
                  <Button primary LeftIcon={BsFillPlayFill} className="mb-8">
                    <p>Đọc ngay</p>
                  </Button>
                </a>
              </Link>

              <p className="text-3xl font-semibold mb-2">{title}</p>

              <DotList>
                {manga.genres.map((genre) => (
                  <span key={genre}>{convert(genre, "genre")}</span>
                ))}
              </DotList>

              <p className="mt-4 text-gray-300 mb-8">{manga.description}</p>

              <div className="flex overflow-x-auto md:scroll-bar snap-x space-x-8 md:space-x-16">
                <InfoItem title="Quốc gia" value={manga.country_of_origin} />

                <InfoItem
                  title="Tình trạng"
                  value={convert(manga.status, "status")}
                />

                <InfoItem
                  title="Giới hạn tuổi"
                  value={manga.is_adult ? "18+" : ""}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 md:space-y-0 px-4 md:grid md:grid-cols-10 w-full min-h-screen mt-8 sm:px-12 gap-8">
          <div className="md:col-span-2 h-[max-content] space-y-4">
            <div className="bg-background-900 rounded-md p-4 space-y-4">
              <InfoItem
                title="Nổi bật"
                value={numberWithCommas(manga.popularity)}
              />
              <InfoItem
                title="Yêu thích"
                value={numberWithCommas(manga.favourites)}
              />
              <InfoItem
                title="Xu hướng"
                value={numberWithCommas(manga.trending)}
              />
            </div>

            <div className="space-y-2 text-gray-400">
              <h1 className="font-semibold">Tags</h1>

              <ul className="space-y-2">
                {manga.tags.map((tag) => (
                  <Link href={`/browse?type=manga&tags=${tag}`} key={tag}>
                    <a className="block">
                      <li className="p-2 rounded-md bg-background-900 hover:text-primary-300 transition duration-300">
                        {tag}
                      </li>
                    </a>
                  </Link>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-8 space-y-12">
            <DetailsSection title="Chapter" className="relative">
              <motion.div
                className="space-y-2 overflow-hidden"
                variants={{
                  animate: {
                    height: "100%",
                  },

                  initial: {
                    height: chapters.length <= 7 ? "100%" : 300,
                  },
                }}
                transition={{ ease: "linear" }}
                animate={isChapterExpanded ? "animate" : "initial"}
              >
                {chapters.map((chapter) => (
                  <Link
                    href={`/manga/read/${manga.ani_id}/${chapter.chapter_id}`}
                    key={chapter.chapter_id}
                  >
                    <a className="block">
                      <p className="line-clamp-1 bg-background-900 p-2 text-sm font-semibold hover:bg-white/20 duration-300 transition">
                        {chapter.name}
                      </p>
                    </a>
                  </Link>
                ))}
              </motion.div>

              {chapters.length > 7 && (
                <CircleButton
                  onClick={() => setIsChapterExpanded(!isChapterExpanded)}
                  outline
                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2"
                  LeftIcon={isChapterExpanded ? BsChevronUp : BsChevronDown}
                />
              )}
            </DetailsSection>

            {!!manga?.characters?.length && (
              <DetailsSection
                title="Nhân vật"
                className="w-full grid md:grid-cols-2 grid-cols-1 gap-4"
              >
                {manga.characters.map((character, index) => (
                  <CharacterConnectionCard
                    type="manga"
                    characterConnection={character}
                    key={index}
                  />
                ))}
              </DetailsSection>
            )}

            {!!manga?.relations?.length && (
              <DetailsSection title="Manga liên quan">
                <List
                  data={manga.relations.map((relation) => relation.manga)}
                  type="manga"
                />
              </DetailsSection>
            )}

            {!!manga?.recommendations?.length && (
              <DetailsSection title="Manga hay khác">
                <List
                  data={manga.recommendations.map(
                    (recommendation) => recommendation.manga
                  )}
                  type="manga"
                />
              </DetailsSection>
            )}

            <DetailsSection title="Bình luận">
              <CommentsSection
                query={{
                  queryFn: (from, to) =>
                    supabase
                      .from<Comment>("comments")
                      .select(
                        `
                        *,
                        user:user_id(*),
                        reply_comments!original_id(
                          comment:reply_id(
                            *,
                            user:user_id(*),
                            reactions:comment_reactions(*)
                          )
                        ),
                        reactions:comment_reactions(*)
                        `
                      )
                      .eq("manga_id", manga.ani_id)
                      .is("is_reply", false)
                      .order("created_at", { ascending: true })
                      .range(from, to),
                  queryKey: ["comments", manga.ani_id],
                }}
                manga_id={manga.ani_id}
              />
            </DetailsSection>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data, error } = await supabase
    .from("manga")
    .select(
      `
        *,
        characters:new_manga_characters!manga_id(*, character:character_id(*)),
        recommendations:manga_recommendations!original_id(manga:recommend_id(*)),
        relations:manga_relations!original_id(manga:relation_id(*)),
        chapters!chapters_manga_id_fkey(*)
      `
    )
    .eq("ani_id", Number(params.id))
    .single();

  if (error) {
    console.log(error);

    return { notFound: true };
  }

  return {
    props: {
      manga: data as Manga,
    },
    revalidate: REVALIDATE_TIME,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await supabase
    .from<Manga>("manga")
    .select("ani_id")
    .order("updated_at", { ascending: false })
    .limit(20);

  const paths = data.map((manga) => ({
    params: { id: manga.ani_id.toString() },
  }));

  return { paths, fallback: "blocking" };
};

export default DetailsPage;
