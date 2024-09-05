import { formatTime } from "@/common/helper";
import { createSignedUrl } from "@/common/storage";
import { useDeleteItemMutation } from "@/pages/ItemsPage/service";
import { Badge, Image, ImageViewer, List, SwipeAction } from "antd-mobile";
import dayjs from "dayjs";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

interface ListItemProps {
  description?: string;
  name: string;
  bucket?: string | null;
  path?: string | null;
  id: number;
  deleteCb?: () => void;
  expiredAt?: string | null;
}

export const ListItem = ({
  description,
  name,
  bucket,
  path,
  id,
  expiredAt,
  deleteCb,
}: ListItemProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [visible, setVisible] = useState(false);

  const [remainingTime, setRemainingTime] = useState(0);

  const deleteItemMutation = useDeleteItemMutation();

  const actionDeleteClick = useCallback(async () => {
    await deleteItemMutation.mutateAsync(id);
    deleteCb?.();
  }, [deleteCb, deleteItemMutation, id]);

  const getSignedUrl = useCallback(async () => {
    if (!bucket || !path) return;
    const url = await createSignedUrl(bucket, path);
    setImageUrl(url);
  }, [bucket, path]);

  useLayoutEffect(() => {
    getSignedUrl();
    setRemainingTime(dayjs(expiredAt).unix() - dayjs().unix());
  }, [expiredAt, getSignedUrl]);

  useEffect(() => {
    if (remainingTime <= 0) return;

    const timerId = setInterval(() => {
      setRemainingTime((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [remainingTime]);

  const badgeConent = useMemo(() => {
    if (remainingTime >= 86400) {
      const days = Math.floor(remainingTime / 86400);
      return `${days}d`;
    }
    if (remainingTime) return formatTime(remainingTime);
  }, [remainingTime]);

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
            <Badge content={badgeConent}>
              <Image
                width={40}
                height={40}
                src={imageUrl}
                onClick={() => setVisible(true)}
              />
            </Badge>
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
