import { ListItem } from "@/components/ListItem/ListItem";
import { useBackButton, useMainButton } from "@telegram-apps/sdk-react";
import { FloatingBubble, Form, List } from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import dayjs from "dayjs";
import { FC, useCallback, useLayoutEffect, useState } from "react";
import ItemPopup from "./ItemPopup";
import { useItemsQuery } from "./service";

export const ItemsPage: FC = () => {
  const mainButton = useMainButton();
  const backButton = useBackButton();
  const [openModal, setOpenModal] = useState(false);

  const [form] = Form.useForm();

  const itemsQuery = useItemsQuery();

  useLayoutEffect(() => {
    mainButton.on("click", () => {
      form.submit();
    });

    backButton.on("click", () => {
      mainButton.hide();
      mainButton.enable();
    });
  }, [backButton, form, mainButton]);

  // Pica instance

  const onOpen = useCallback(() => {
    setOpenModal(true);
    mainButton.setText("Create");
    mainButton.enable();
    mainButton.show();
  }, [mainButton]);

  return (
    <>
      <List header="Items" className="w-full">
        {(itemsQuery.data?.length ?? 0) > 0 ? (
          itemsQuery.data?.map(
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
                  deleteCb={() => itemsQuery.refetch()}
                  description={description}
                  expiredAt={expired_at}
                  status={status}
                  location={location}
                />
              );
            },
          )
        ) : (
          <List.Item>No items found</List.Item>
        )}
      </List>

      <ItemPopup
        cb={() => itemsQuery.refetch()}
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
