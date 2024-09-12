import { formatTime } from "@/common/helper";
import { createSignedUrl } from "@/common/storage";
import { CategoryEnum, ItemInterface } from "@/pages/ItemsPage/interface";
import {
  useAteItemCategoryFoodMutation,
  useDeleteItemMutation,
} from "@/pages/ItemsPage/service";
import {
  Badge,
  Image,
  ImageViewer,
  List,
  Modal,
  Space,
  SwipeAction,
} from "antd-mobile";
import { CloseOutline, DeleteOutline } from "antd-mobile-icons";
import dayjs from "dayjs";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

interface ItemProps {
  deleteCb?: () => void;
  item: ItemInterface;
}

export const ListItem = ({ item, deleteCb }: ItemProps) => {
  const { description, name, bucket, path, id, expired_at, location, note } =
    item;
  const [imageUrl, setImageUrl] = useState("");
  const [visible, setVisible] = useState(false);

  const [remainingTime, setRemainingTime] = useState(0);

  const deleteItemMutation = useDeleteItemMutation();
  const ateItemCategoryFoodMutation = useAteItemCategoryFoodMutation();

  const actionDeleteClick = useCallback(async () => {
    Modal.confirm({
      content: (
        <div className="text-center">
          Are you sure you want to delete this item?
        </div>
      ),
      onConfirm: async () => {
        await deleteItemMutation.mutateAsync(id);
        deleteCb?.();
      },
      confirmText: "Delete",
      cancelText: "Cancel",
      header: (
        <DeleteOutline
          style={{
            fontSize: 42,
            color: "var(--adm-color-danger)",
          }}
        />
      ),
    });
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

  const descriptionText = useMemo(() => {
    return (
      dayjs(expired_at).format("DD/MM/YYYY") +
      (note ? ` - ${note}` : "") +
      (description ? ` - ${description}` : "")
    );
  }, [description, expired_at, note]);

  const actionAteClick = useCallback(async () => {
    await ateItemCategoryFoodMutation.mutateAsync(id);
  }, [ateItemCategoryFoodMutation, id]);

  return (
    <>
      <SwipeAction
        rightActions={[
          {
            key: "delete",
            text: (
              <Space className="items-center">
                <DeleteOutline /> Delete
              </Space>
            ),
            color: "danger",
            onClick: actionDeleteClick,
          },
        ]}
        leftActions={
          item.category === CategoryEnum.FOODS
            ? [
                {
                  key: "ate",
                  text: (
                    <Space className="items-center">
                      <CloseOutline /> Ate
                    </Space>
                  ),
                  color: "success",
                  onClick: actionAteClick,
                },
              ]
            : undefined
        }
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
          description={descriptionText}
          title={location}
          extra={
            remainingTime <= 0 ? (
              <span className="text-red-600 font-semibold text-xs">
                Expired
              </span>
            ) : (
              ""
            )
          }
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
