import { uploadFile } from "@/common/helper";
import { useMainButton } from "@telegram-apps/sdk-react";
import {
  Button,
  CalendarPicker,
  Form,
  ImageUploader,
  Input,
  Popup,
  Radio,
  Space,
  TextArea,
} from "antd-mobile";
import dayjs from "dayjs";
import pica from "pica";
import { useCallback, useState } from "react";
import { FormFields } from "./interface";
import { useCreateItemMutation } from "./service";

interface ItemPopupProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  cb: () => void;
}

const ItemPopup = ({ openModal, setOpenModal, cb }: ItemPopupProps) => {
  const [form] = Form.useForm();
  const [imageUploadFile, setImageUploadFile] = useState<File | undefined>();
  const [calendarPickerVisible, setCalendarPickerVisible] =
    useState<boolean>(false);
  const [expiredAt, setExpiredAt] = useState<Date | undefined>(undefined);

  const mainButton = useMainButton();
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

      mainButton.showLoader();
      mainButton.disable();
      mainButton.setText("Creating...");

      const bucket = "items";
      let path = undefined;

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
      setExpiredAt(undefined);

      cb?.();
    },
    [
      cb,
      createItemMutation,
      expiredAt,
      form,
      imageUploadFile,
      mainButton,
      resizeImage,
      setOpenModal,
    ],
  );

  return (
    <Popup visible={openModal} onMaskClick={() => setOpenModal(false)}>
      <div style={{ height: "60vh", overflowY: "scroll" }}>
        <Form layout="vertical" form={form} onFinish={formSubmit}>
          <Form.Item label="Name" name="name">
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

          {import.meta.env.VITE_IS_LOCAL_DEV === "true" && (
            <Form.Item>
              <Button block color="primary" onClick={() => form.submit()}>
                Submit
              </Button>
            </Form.Item>
          )}
        </Form>
      </div>
    </Popup>
  );
};

export default ItemPopup;
