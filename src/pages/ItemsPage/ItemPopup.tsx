import { uploadFile } from "@/common/helper";
import {
  Button,
  CalendarPicker,
  Form,
  ImageUploader,
  Input,
  Popup,
  Selector,
  TextArea,
  Toast,
} from "antd-mobile";
import dayjs from "dayjs";
import pica from "pica";
import { useCallback, useState } from "react";
import { CategoryEnum, FormFields } from "./interface";
import { useCreateItemMutation } from "./service";

interface ItemPopupProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  cb: () => void;
  category: CategoryEnum;
}

const ItemPopup = ({
  openModal,
  setOpenModal,
  cb,
  category,
}: ItemPopupProps) => {
  const [form] = Form.useForm();
  const [imageUploadFile, setImageUploadFile] = useState<File | undefined>();
  const [calendarPickerVisible, setCalendarPickerVisible] =
    useState<boolean>(false);
  const [expiredAt, setExpiredAt] = useState<Date | undefined>(undefined);

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
      delete values.file;
      const location = values.location?.[0] ?? "dry";
      delete values.location;

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

      cb?.();
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

  return (
    <Popup visible={openModal} onMaskClick={() => setOpenModal(false)}>
      <div style={{ height: "60vh", overflowY: "scroll" }}>
        <Form layout="vertical" form={form} onFinish={formSubmit}>
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
              options={["dry", "wet", "refrigerator", "freezer"].map(
                (value) => {
                  return { label: value, value };
                },
              )}
            />
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
            />
          </Form.Item>

          <Form.Item>
            <Button
              block
              color="primary"
              onClick={() => form.submit()}
              loading={createItemMutation.isPending}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Popup>
  );
};

export default ItemPopup;
