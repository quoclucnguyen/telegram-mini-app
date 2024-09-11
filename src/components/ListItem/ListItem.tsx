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

export interface ItemInterface {
  description: string | null;
  name: string;
  bucket: string | null;
  path: string | null;
  id: number;
  status: "out_date" | "ate" | null;
  location?: "dry" | "wet" | "refrigerator" | "freezer";
  note: string | null;
  expired_at: string | null;
}

interface ItemProps extends ItemInterface {
  deleteCb?: () => void;
}

export const ListItem = ({
  description,
  name,
  bucket,
  path,
  id,
  deleteCb,
  expired_at,
  location,
}: ItemProps) => {
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
    setRemainingTime(dayjs(expired_at).unix() - dayjs().unix());
  }, [expired_at, getSignedUrl]);

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
    if (remainingTime > 0) return formatTime(remainingTime);
  }, [remainingTime]);

  const badgeColor = useMemo(() => {
    if (remainingTime >= 86400 * 3) {
      return "green";
    }
    if (remainingTime >= 86400) {
      return "orange";
    }
    return "red";
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
            <Badge content={badgeConent} color={badgeColor}>
              <Image
                width={40}
                height={40}
                src={imageUrl}
                onClick={() => setVisible(true)}
              />
            </Badge>
          }
          description={description}
          title={location}
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
