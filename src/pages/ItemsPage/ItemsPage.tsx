import { uploadFile } from "@/common/helper";
import { ListItem } from "@/components/ListItem/ListItem";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useBackButton, useMainButton } from "@telegram-apps/sdk-react";
import { Input, Modal, Select, Textarea } from "@telegram-apps/telegram-ui";
import { FloatingBubble, ImageUploader, List } from "antd-mobile";
import { AddCircleOutline } from "antd-mobile-icons";
import { FC, useCallback, useLayoutEffect, useState } from "react";
import { z } from "zod";
import { FormFields } from "./interface";
import {
  useCreateItemMutation,
  useItemsQuery,
} from "./service";

export const ItemsPage: FC = () => {
  const mainButton = useMainButton();
  const backButton = useBackButton();

  const createItemMutation = useCreateItemMutation();

  const [openModal, setOpenModal] = useState(false);
  const [imageUploadFile, setImageUploadFile] = useState<File | undefined>();

  const itemsQuery = useItemsQuery();

  useLayoutEffect(() => {
    mainButton.on("click", () => {
      form.handleSubmit();
    });

    backButton.on("click", () => {
      mainButton.hide();
      mainButton.enable();
    });
  }, []);

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
      mainButton.setText("Creating...");

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

      itemsQuery.refetch();
    },
  });

  const onOpen = useCallback(() => {
    setOpenModal(true);
    mainButton.setText("Create");
    mainButton.enable();
    mainButton.show();
  }, []);

  return (
    <>
      <List header="Items" className="w-full">
        {(itemsQuery.data?.length ?? 0) > 0 ? (
          itemsQuery.data?.map(({ id, name, bucket, path }) => (
            <ListItem key={id} name={name} bucket={bucket} path={path} id={id} deleteCb={()=> itemsQuery.refetch()} />
          ))
        ) : (
          <List.Item>No items found</List.Item>
        )}
      </List>

      {openModal && (
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
                    status={
                      field.state.meta.errors.length ? "error" : "default"
                    }
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
      )}

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
