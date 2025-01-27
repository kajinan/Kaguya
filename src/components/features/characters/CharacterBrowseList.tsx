import CharacterCard from "@/components/shared/CharacterCard";
import Input from "@/components/shared/Input";
import InView from "@/components/shared/InView";
import List from "@/components/shared/List";
import ListSkeleton from "@/components/skeletons/ListSkeleton";
import useBirthdayCharacters from "@/hooks/useBirthdayCharacters";
import { UseBrowseOptions } from "@/hooks/useBrowseAnime";
import useCharacterSearch from "@/hooks/useCharacterSearch";
import useFavouriteCharacters from "@/hooks/useFavouriteCharacters";
import { debounce } from "debounce";
import React, { useMemo, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

interface BrowseListProps {
  defaultQuery?: UseBrowseOptions;
}

const BrowseList: React.FC<BrowseListProps> = ({ defaultQuery }) => {
  const [keyword, setKeyword] = useState(defaultQuery.keyword || "");

  const {
    data: searchResult,
    isLoading: searchIsLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError: searchIsError,
  } = useCharacterSearch(keyword);

  const { data: birthdayCharacters, isLoading: birthdayIsLoading } =
    useBirthdayCharacters();
  const { data: favouritesCharacters, isLoading: favouritesIsLoading } =
    useFavouriteCharacters();

  const handleFetch = () => {
    if (isFetchingNextPage || !hasNextPage) return;

    fetchNextPage();
  };

  const handleInputChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value),
    500
  );

  const totalData = useMemo(
    () => searchResult?.pages.map((el) => el.data).flat(),
    [searchResult?.pages]
  );

  return (
    <div className="min-h-screen">
      <form className="space-y-4">
        <Input
          containerInputClassName="border border-white/80"
          LeftIcon={AiOutlineSearch}
          onChange={handleInputChange}
          defaultValue={keyword}
          label="Tìm kiếm"
          containerClassName="w-full md:w-96"
          placeholder="Tên nhân vật"
        />
      </form>

      <div className="mt-8">
        {keyword ? (
          !searchIsLoading ? (
            <React.Fragment>
              <List
                type="characters"
                data={totalData}
                onEachCard={(character) => (
                  <CharacterCard character={character} />
                )}
              />

              {isFetchingNextPage && !searchIsError && (
                <div className="mt-4">
                  <ListSkeleton />
                </div>
              )}

              {((totalData.length && !isFetchingNextPage) || hasNextPage) && (
                <InView onInView={handleFetch} />
              )}

              {!hasNextPage && !!totalData.length && (
                <p className="mt-8 text-2xl text-center">Hết rồi...</p>
              )}
            </React.Fragment>
          ) : (
            <ListSkeleton />
          )
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Sinh nhật</h2>

              {birthdayIsLoading ? (
                <ListSkeleton />
              ) : (
                <List
                  type="characters"
                  data={birthdayCharacters}
                  onEachCard={(character) => (
                    <CharacterCard character={character} />
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Được yêu thích</h2>

              {favouritesIsLoading ? (
                <ListSkeleton />
              ) : (
                <List
                  type="characters"
                  data={favouritesCharacters}
                  onEachCard={(character) => (
                    <CharacterCard character={character} />
                  )}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseList;
