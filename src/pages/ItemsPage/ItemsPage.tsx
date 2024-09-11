import { ItemInterface, ListItem } from "@/components/ListItem/ListItem";
import { useMainButton } from "@telegram-apps/sdk-react";
import {
  FloatingBubble,
  InfiniteScroll,
  List,
  PullToRefresh,
} from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import dayjs from "dayjs";
import { FC, useCallback, useState } from "react";
import ItemPopup from "./ItemPopup";
import { useGetItemsMutation } from "./service";

export const ItemsPage: FC = () => {
  const mainButton = useMainButton();

  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<ItemInterface[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const getItemsMutation = useGetItemsMutation();

  const loadMore = useCallback(async () => {
    const append = await getItemsMutation.mutateAsync({ take: 5, offset });
    if (append) {
      setData((val) => [...val, ...append]);
    }
    setHasMore((append?.length ?? 0) > 0);
    setOffset((val) => val + 5);
  }, [getItemsMutation, offset]);

  const onOpen = useCallback(() => {
    setOpenModal(true);
    mainButton.setText("Create");
    mainButton.enable();
    mainButton.show();
  }, [mainButton]);

  return (
    <>
      <PullToRefresh
        onRefresh={async () => {
          Promise.all([setOffset(0)]);
          setData([]);
        }}
      >
        <List header="Items" className="w-full">
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
        }}
        openModal={openModal}
        setOpenModal={setOpenModal}
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
