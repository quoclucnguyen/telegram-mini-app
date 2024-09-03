import { createSignedUrl } from "@/common/storage";
import { Image, ImageViewer, List, SwipeAction } from "antd-mobile";
import { useCallback, useLayoutEffect, useState } from "react";

interface ListItemProps {
  description?: string;
  name: string;
  bucket?: string;
  path?: string;
}

export const ListItem = ({
  description,
  name,
  bucket,
  path,
}: ListItemProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [visible, setVisible] = useState(false);

  const actionDeleteClick = useCallback(() => {}, []);

  const getSignedUrl = useCallback(async () => {
    if (!bucket || !path) return;
    const url = await createSignedUrl(bucket, path);
    setImageUrl(url);
  }, []);

  useLayoutEffect(() => {
    getSignedUrl();
  }, []);

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
