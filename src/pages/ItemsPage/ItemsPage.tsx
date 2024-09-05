import { uploadFile } from "@/common/helper";
import { ListItem } from "@/components/ListItem/ListItem";
import { useBackButton, useMainButton } from "@telegram-apps/sdk-react";
import {
  CalendarPicker,
  FloatingBubble,
  Form,
  ImageUploader,
  Input,
  List,
  Popup,
  Radio,
  Space,
  TextArea,
} from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import dayjs from "dayjs";
import { FC, useCallback, useLayoutEffect, useState } from "react";
import { FormFields } from "./interface";
import { useCreateItemMutation, useItemsQuery } from "./service";

export const ItemsPage: FC = () => {
  const mainButton = useMainButton();
  const backButton = useBackButton();

  const createItemMutation = useCreateItemMutation();

  const [openModal, setOpenModal] = useState(false);
  const [imageUploadFile, setImageUploadFile] = useState<File | undefined>();
  const [calendarPickerVisible, setCalendarPickerVisible] =
    useState<boolean>(false);
  const [expiredAt, setExpiredAt] = useState<Date | undefined>(undefined);
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

  const formSubmit = useCallback(
    async (values: FormFields) => {
      delete values.file;

      mainButton.showLoader();
      mainButton.disable();
      mainButton.setText("Creating...");

      const bucket = "items";
      let path = undefined;

      if (imageUploadFile) {
        const { path: resultPath } = await uploadFile(
          imageUploadFile,
          "items",
          "images",
        );

        if (resultPath) {
          path = resultPath;
        }
      }

      await createItemMutation.mutateAsync({
        ...values,
        bucket,
        path,
        expired_at: expiredAt
          ? dayjs(expiredAt)
              .set("hour", 23)
              .set("minute", 59)
              .set("second", 59)
              .toISOString()
          : undefined,
      });

      mainButton.hideLoader();
      mainButton.enable();
      mainButton.hide();
      form.resetFields();
      setImageUploadFile(undefined);
      setOpenModal(false);

      itemsQuery.refetch();
    },
    [
      createItemMutation,
      expiredAt,
      form,
      imageUploadFile,
      itemsQuery,
      mainButton,
    ],
  );

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
      <Popup visible={openModal} onMaskClick={() => setOpenModal(false)}>
        <div style={{ height: "60vh", overflowY: "scroll" }}>
          <Form layout="vertical" form={form} onFinish={formSubmit}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>

            <Form.Item label="Location" name="location">
              <Radio.Group defaultValue="1">
                <Space direction="vertical">
                  {["dry", "wet", "refrigerator", "freezer"].map((item) => (
                    <Radio key={item} value={item}>
                      {item}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Description" name="description">
              <TextArea />
            </Form.Item>

            <Form.Item label="Note" name="note">
              <TextArea />
            </Form.Item>

            <Form.Item label="Image" name={"file"}>
              <ImageUploader
                maxCount={1}
                upload={async (file: File) => {
                  console.log(file);
                  setImageUploadFile(file);
                  return {
                    url: URL.createObjectURL(file),
                  };
                }}
              />
            </Form.Item>

            <Form.Item
              label="Expired at"
              onClick={() => setCalendarPickerVisible(true)}
            >
              <Input
                disabled
                value={expiredAt ? dayjs(expiredAt).format("DD/MM/YYYY") : ""}
              />

              <CalendarPicker
                visible={calendarPickerVisible}
                selectionMode="single"
                onClose={() => setCalendarPickerVisible(false)}
                onMaskClick={() => setCalendarPickerVisible(false)}
                onChange={(val) => {
                  setExpiredAt(dayjs(val ?? null).toDate());
                }}
              />
            </Form.Item>

            {/* <Form.Item>
              <Button block color="primary" onClick={() => form.submit()}>
                Block Button
              </Button>
            </Form.Item> */}
          </Form>
        </div>
      </Popup>

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
