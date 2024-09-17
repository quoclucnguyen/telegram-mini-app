import {
  FloatingBubble,
  Grid,
  InfiniteScroll,
  List,
  PullToRefresh,
  Tag,
} from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import { useCallback, useEffect, useState } from "react";
import { useCategoryTabFilterStore } from "./hook";
import { CategoryEnum, ItemInterface } from "./interface";
import ItemPopup from "./ItemPopup";
import { ListItem } from "./ListItem";
import {
  useCountItemsByCategoryByExpiredAtQuery,
  useGetItemsMutation,
} from "./service";

export interface ItemCategoryTabProps {
  category: CategoryEnum;
  activeKey: CategoryEnum;
  popupSubmitCb: () => void;
}

const ItemsPageCategoryTab = ({
  category,
  activeKey,
  popupSubmitCb,
}: ItemCategoryTabProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<ItemInterface[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { filter } = useCategoryTabFilterStore();
  const [action, setAction] = useState<"create" | "edit" | undefined>(
    undefined,
  );

  const [selectedItem, setSelectedItem] = useState<ItemInterface | undefined>(
    undefined,
  );

  const countGoodQuery = useCountItemsByCategoryByExpiredAtQuery(
    category,
    "good",
    filter,
  );
  const countSoonQuery = useCountItemsByCategoryByExpiredAtQuery(
    category,
    "soon",
    filter,
  );
  const countTodayQuery = useCountItemsByCategoryByExpiredAtQuery(
    category,
    "today",
    filter,
  );
  const countExpiredQuery = useCountItemsByCategoryByExpiredAtQuery(
    category,
    "expired",
    filter,
  );

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
    countExpiredQuery.refetch();
    countGoodQuery.refetch();
    countSoonQuery.refetch();
    countTodayQuery.refetch();
  }, [countExpiredQuery, countGoodQuery, countSoonQuery, countTodayQuery]);

  useEffect(() => {
    if (activeKey === category) {
      reset();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, category]);

  return (
    <>
      <Grid className="mx-3 my-2 text-center" columns={4}>
        <Grid.Item>
          <Tag color="success" fill="outline">
            {countGoodQuery.data} good
          </Tag>
        </Grid.Item>

        <Grid.Item>
          <Tag color="warning" fill="outline">
            {countSoonQuery.data} soon
          </Tag>
        </Grid.Item>

        <Grid.Item>
          <Tag color="danger" fill="outline">
            {countTodayQuery.data} today
          </Tag>
        </Grid.Item>

        <Grid.Item>
          <Tag color="default" fill="outline">
            {countExpiredQuery.data} expired
          </Tag>
        </Grid.Item>
      </Grid>
      <PullToRefresh onRefresh={reset}>
        <List className="w-full">
          {data.length > 0 ? (
            data.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  deleteCb={() => {
                    setData((val) => val.filter((v) => v.id !== item.id));
                    reset();
                    popupSubmitCb();
                  }}
                  item={item}
                  onEdit={() => {
                    console.log(item);

                    setAction("edit");
                    setOpenModal(true);
                    setSelectedItem(item);
                  }}
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
          reset();
          popupSubmitCb();
        }}
        openModal={openModal}
        setOpenModal={setOpenModal}
        category={category}
        action={action}
        selectedItem={selectedItem}
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
