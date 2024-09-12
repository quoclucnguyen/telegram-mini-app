import { ItemInterface, ListItem } from "@/components/ListItem/ListItem";
import {
  FloatingBubble,
  InfiniteScroll,
  List,
  PullToRefresh,
  SearchBar,
} from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { CategoryEnum } from "./interface";
import ItemPopup from "./ItemPopup";
import { useGetItemsMutation } from "./service";

export interface ItemCategoryTabProps {
  category: CategoryEnum;
  activeKey: CategoryEnum;
}

const ItemsPageCategoryTab = ({
  category,
  activeKey,
}: ItemCategoryTabProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<ItemInterface[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const getItemsMutation = useGetItemsMutation(category);

  const loadMore = useCallback(async () => {
    const append = await getItemsMutation.mutateAsync({
      take: 5,
      offset,
      keyword: debouncedSearchTerm,
    });
    if (append) {
      setData((val) => [...val, ...append]);
    }
    setHasMore((append?.length ?? 0) > 0);
    setOffset((val) => val + 5);
  }, [debouncedSearchTerm, getItemsMutation, offset]);

  const onOpen = useCallback(() => {
    setOpenModal(true);
  }, []);

  const debouncedSetSearchTerm = useCallback((value: string) => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (value: string): void => {
    debouncedSetSearchTerm(value);
  };

  useEffect(() => {
    Promise.all([setOffset(0)]);
    setData([]);
    setHasMore(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const reset = useCallback(async () => {
    setOffset(0);
    setData([]);
    setHasMore(true);
  }, []);

  useEffect(() => {
    if (activeKey === category) {
      reset();
    }
  }, [reset, activeKey, category]);

  return (
    <>
      <PullToRefresh onRefresh={reset}>
        <SearchBar
          placeholder="Search"
          style={{ "--border-radius": "0px" }}
          onChange={handleChange}
          onClear={() => {
            setDebouncedSearchTerm("");
            reset();
          }}
        />
        <List className="w-full">
          {data.length > 0 ? (
            data.map(
              ({
                id,
                name,
                bucket,
                path,
                note,
                expired_at,
                status,
                location,
              }) => {
                const description =
                  dayjs(expired_at).format("DD/MM-YYYY") +
                  (note ? ` - ${note}` : "");

                return (
                  <ListItem
                    key={id}
                    name={name}
                    bucket={bucket}
                    path={path}
                    id={id}
                    deleteCb={() => {
                      setData((val) => val.filter((v) => v.id !== id));
                    }}
                    description={description}
                    expired_at={expired_at}
                    status={status}
                    location={location}
                    note={null}
                  />
                );
              },
            )
          ) : (
            <List.Item>No items found</List.Item>
          )}
        </List>

        <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
      </PullToRefresh>

      <ItemPopup
        cb={async () => {
          Promise.all([setOffset(0)]);
          setData([]);
          setHasMore(true);
        }}
        openModal={openModal}
        setOpenModal={setOpenModal}
        category={category}
      />

      <FloatingBubble
        style={{
          "--initial-position-bottom": "10px",
          "--initial-position-right": "10px",
          "--edge-distance": "24px",
        }}
        onClick={() => {
          onOpen();
        }}
      >
        <AddCircleOutline fontSize={32} />
      </FloatingBubble>
    </>
  );
};

export default ItemsPageCategoryTab;
