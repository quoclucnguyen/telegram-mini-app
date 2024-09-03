import { uploadFile } from "@/common/helper";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useBackButton, useMainButton } from "@telegram-apps/sdk-react";
import { Input, Modal, Select, Textarea } from "@telegram-apps/telegram-ui";
import { ImageUploader } from "antd-mobile";
import { FC, useEffect, useState } from "react";
import { z } from "zod";
import { FormFields } from "./interface";
import { useCreateItemMutation } from "./service";

export const ItemsPage: FC = () => {
  const mainButton = useMainButton();
  const createItemMutation = useCreateItemMutation();
  const backButton = useBackButton();

  const [openModal, setOpenModal] = useState(false);
  const [imageUploadFile, setImageUploadFile] = useState<File | undefined>();

  backButton.on("click", () => {
    mainButton.hide();
    mainButton.enable();
  });

  mainButton.on("click", () => {
    console.log("click");
    form.handleSubmit();
  });

  const form = useForm<FormFields>({
    defaultValues: {
      name: "",
      location: "dry",
      description: "",
      note: "",
    },
    onSubmit: async ({ value }) => {
      mainButton.showLoader();
      mainButton.disable();

      const bucket = "items";
      let path = undefined;

      if (imageUploadFile) {
        const { path: resultPath } = await uploadFile(
          imageUploadFile,
          "items",
          "images"
        );

        if (resultPath) {
          path = resultPath;
        }
      }

      await createItemMutation.mutateAsync({ ...value, bucket, path });

      mainButton.hideLoader();
      mainButton.enable();
      mainButton.hide();
      form.reset();
      setOpenModal(false);
    },
  });

  useEffect(() => {}, []);

  return (
    <Modal open={openModal}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="name"
          validatorAdapter={zodValidator()}
          validators={{
            onChange: z.string().min(1),
          }}
        >
          {(field) => {
            return (
              <Input
                name={field.name}
                header="Name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                status={field.state.meta.errors.length ? "error" : "default"}
                itemRef="name"
              />
            );
          }}
        </form.Field>

        <form.Field name="location">
          {(field) => (
            <Select
              name={field.name}
              header="Location"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value as FormFields["location"])
              }
            >
              <option value={"dry"}>Dry</option>
              <option value={"wet"}>Wet</option>
              <option value={"refrigerator"}>Refrigerator</option>
              <option value={"freezer"}>Freezer</option>
            </Select>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Textarea
              header="Description"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="note">
          {(field) => (
            <Textarea
              header="Note"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <div className="px-[22px] pt-[20px] pb-[16px]">
          <ImageUploader
            maxCount={1}
            upload={async (file: File) => {
              setImageUploadFile(file);
              return {
                url: URL.createObjectURL(file),
              };
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
