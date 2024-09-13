import {
  FloatingBubble,
  InfiniteScroll,
  List,
  PullToRefresh,
} from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import { useCallback, useEffect, useState } from "react";
import { useCategoryTabFilterStore } from "./hook";
import { CategoryEnum, ItemInterface } from "./interface";
import ItemPopup from "./ItemPopup";
import { ListItem } from "./ListItem";
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
  const { filter } = useCategoryTabFilterStore();

  const getItemsMutation = useGetItemsMutation(category);

  const loadMore = useCallback(async () => {
    const append = await getItemsMutation.mutateAsync({
      take: 5,
      offset,
      keyword: filter,
    });
    if (append) {
      setData((val) => [...val, ...(append as ItemInterface[])]);
    }
    setHasMore((append?.length ?? 0) > 0);
    setOffset((val) => val + 5);
  }, [filter, getItemsMutation, offset]);

  const onOpen = useCallback(() => {
    setOpenModal(true);
  }, []);

  useEffect(() => {
    Promise.all([setOffset(0)]);
    setData([]);
    setHasMore(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

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
        <List className="w-full">
          {data.length > 0 ? (
            data.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  deleteCb={() => {
                    setData((val) => val.filter((v) => v.id !== item.id));
                  }}
                  item={item}
                />
              );
            })
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
