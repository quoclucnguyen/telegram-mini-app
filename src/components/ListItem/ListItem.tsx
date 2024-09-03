import { Image, ImageViewer, List, SwipeAction } from "antd-mobile";
import { useCallback, useState } from "react";

interface ListItemProps {
  description?: string;
  name: string;
}

export const ListItem = ({ description, name }: ListItemProps) => {
  const [imageUrl] = useState("");
  const [visible, setVisible] = useState(false);

  const actionDeleteClick = useCallback(() => {}, []);

  return (
    <>
      <SwipeAction
        rightActions={[
          {
            key: "delete",
            text: "Delete",
            color: "danger",
            onClick: actionDeleteClick,
          },
        ]}
      >
        <List.Item
          prefix={
            <Image
              width={40}
              height={40}
              src={imageUrl}
              onClick={() => setVisible(true)}
            />
          }
          description={description}
        >
          {name}
        </List.Item>
      </SwipeAction>

      {imageUrl && (
        <ImageViewer
          classNames={{
            mask: "customize-mask",
            body: "customize-body",
          }}
          image={imageUrl}
          visible={visible}
          onClose={() => {
            setVisible(false);
          }}
        />
      )}
    </>
  );
};
