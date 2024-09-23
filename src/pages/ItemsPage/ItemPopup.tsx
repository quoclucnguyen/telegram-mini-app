import { uploadFile } from "@/common/helper";
import {
  Button,
  CalendarPicker,
  DatePicker,
  Form,
  ImageUploader,
  ImageUploadItem,
  Input,
  Popup,
  Selector,
  TextArea,
  Toast,
} from "antd-mobile";

import { createSignedUrl } from "@/common/storage";
import dayjs from "dayjs";
import pica from "pica";
import { useCallback, useEffect, useState } from "react";
import {
  CategoryEnum,
  FormFields,
  ItemInterface,
  LocationEnum,
  QUICK_DATE_ENUM,
} from "./interface";
import { useCreateItemMutation } from "./service";

interface ItemPopupProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  cb: () => void;
  category: CategoryEnum;
  action?: "create" | "edit";
  selectedItem?: ItemInterface;
}

const ItemPopup = ({
  openModal,
  setOpenModal,
  cb,
  category,
  action,
  selectedItem,
}: ItemPopupProps) => {
  const [imageUploadFile, setImageUploadFile] = useState<File | undefined>();
  const [calendarPickerVisible, setCalendarPickerVisible] =
    useState<boolean>(false);
  const [expiredAt, setExpiredAt] = useState<Date | undefined>(undefined);
  const [form] = Form.useForm<FormFields>();
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  const [loading, setLoading] = useState(false);

  const createItemMutation = useCreateItemMutation();

  const picaInstance = pica();

  const resizeImage = useCallback(
    async (file: File) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");

      const reader = new FileReader();

      // Convert file to image element
      return new Promise<File>((resolve, reject) => {
        reader.onload = async (e) => {
          img.src = e.target?.result as string;

          img.onload = async () => {
            const width = 800; // Desired width, you can adjust this
            const height = (img.height * width) / img.width;

            canvas.width = width;
            canvas.height = height;

            try {
              // Resize using Pica
              await picaInstance.resize(img, canvas);
              const resizedBlob = await picaInstance.toBlob(canvas, file.type);

              // Convert the blob back to a File object for upload
              const resizedFile = new File([resizedBlob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(resizedFile);
            } catch (err) {
              reject(err as Error);
            }
          };
        };

        reader.onerror = () => reject(new Error("Failed to load image"));
        reader.readAsDataURL(file);
      });
    },
    [picaInstance],
  );

  const formSubmit = useCallback(
    async (values: FormFields) => {
      setLoading(true);
      try {
        delete values.file;
        const location = values.location?.[0] ?? LocationEnum.DRY;
        delete values.location;
        const type = values.type?.[0] ?? undefined;
        delete values.type;

        const bucket = "items";
        let path = undefined;

        if (!expiredAt) {
          Toast.show("Please select expired date");
          return;
        }

        if (imageUploadFile) {
          const { path: resultPath } = await uploadFile(
            await resizeImage(imageUploadFile),
            "items",
            "images",
          );

          if (resultPath) {
            path = resultPath;
          }
        }

        await createItemMutation.mutateAsync({
          ...values,
          location,
          bucket,
          path,
          category,
          type,
          expired_at: expiredAt
            ? dayjs(expiredAt)
                .set("hour", 23)
                .set("minute", 59)
                .set("second", 59)
                .toISOString()
            : undefined,
        });

        form.resetFields();
        setImageUploadFile(undefined);
        setOpenModal(false);
        setExpiredAt(undefined);
        setFileList([]);

        cb?.();

        setLoading(false);
      } catch (err) {
        console.error(err);
        Toast.show("Failed to create item");
        setLoading(false);
        return;
      }
    },
    [
      category,
      cb,
      createItemMutation,
      expiredAt,
      form,
      imageUploadFile,
      resizeImage,
      setOpenModal,
    ],
  );

  useEffect(() => {
    if (action === "edit" && selectedItem) {
      const {
        name,
        description,
        note,
        location,
        type,
        expired_at,
        bucket,
        path,
      } = selectedItem;
      form.setFieldsValue({
        name: name,
        description: description ?? "",
        note: note ?? "",
        location: [location ?? LocationEnum.DRY],
        type: type ? [type] : undefined,
      });
      setExpiredAt(expired_at ? new Date(expired_at) : undefined);

      if (bucket && path) {
        createSignedUrl(bucket, path).then((url) => {
          setFileList([
            {
              url,
            },
          ]);
        });
      } else {
        setFileList([]);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, selectedItem]);

  return (
    <Popup visible={openModal} onMaskClick={() => setOpenModal(false)}>
      <div style={{ height: "60vh", overflowY: "scroll" }}>
        <div className="pl-4 my-4 text-lg">
          {action === "create" ? "Create Item" : "Edit Item"}
        </div>
        <Form layout="vertical" form={form} onFinish={formSubmit}>
          <Form.Item label="Image">
            <ImageUploader
              upload={async (file: File) => {
                setImageUploadFile(file);
                return {
                  url: URL.createObjectURL(file),
                };
              }}
              value={fileList}
              onChange={setFileList}
            />
          </Form.Item>

          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Selector
              options={Object.values(LocationEnum).map((value) => {
                return { label: value, value };
              })}
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea />
          </Form.Item>

          <Form.Item label="Note" name="note">
            <TextArea />
          </Form.Item>

          <Form.Item label="" name="">
            <Selector
              options={Object.values(QUICK_DATE_ENUM).map((value) => {
                return { label: value, value };
              })}
              onChange={(values: QUICK_DATE_ENUM[]) => {
                if (values[0]) {
                  switch (values[0]) {
                    case QUICK_DATE_ENUM["1d"]:
                      setExpiredAt(dayjs().add(1, "day").toDate());
                      break;
                    case QUICK_DATE_ENUM["3d"]:
                      setExpiredAt(dayjs().add(3, "day").toDate());
                      break;
                    case QUICK_DATE_ENUM["1w"]:
                      setExpiredAt(dayjs().add(7, "day").toDate());
                      break;
                    case QUICK_DATE_ENUM["1m"]:
                      setExpiredAt(dayjs().add(1, "month").toDate());
                      break;
                    case QUICK_DATE_ENUM["3m"]:
                      setExpiredAt(dayjs().add(3, "month").toDate());
                      break;
                    case QUICK_DATE_ENUM["6m"]:
                      setExpiredAt(dayjs().add(6, "month").toDate());
                      break;
                    case QUICK_DATE_ENUM["1y"]:
                      setExpiredAt(dayjs().add(1, "year").toDate());
                      break;
                    case QUICK_DATE_ENUM["2y"]:
                      setExpiredAt(dayjs().add(2, "year").toDate());
                      break;
                  }
                }
              }}
            />
          </Form.Item>

          {category === CategoryEnum.FOODS && (
            <Form.Item
              label="Expired at"
              onClick={() => setCalendarPickerVisible(true)}
              rules={[
                {
                  required: true,
                },
              ]}
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
                min={dayjs().toDate()}
                max={dayjs().add(12, "months").toDate()}
                value={expiredAt}
              />
            </Form.Item>
          )}

          {category !== CategoryEnum.FOODS && (
            <Form.Item
              label="Expired at"
              onClick={() => {
                setCalendarPickerVisible(true);
              }}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker
                visible={calendarPickerVisible}
                onClose={() => setCalendarPickerVisible(false)}
                onConfirm={(val) => {
                  setExpiredAt(dayjs(val ?? null).toDate());
                }}
              >
                {() => (expiredAt ? dayjs(expiredAt).format("YYYY-MM-DD") : "")}
              </DatePicker>
            </Form.Item>
          )}

          <Form.Item>
            <Button
              block
              color="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Popup>
  );
};

export default ItemPopup;
