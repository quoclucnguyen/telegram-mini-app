import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useMainButton } from "@telegram-apps/sdk-react";
import {
  Button,
  Input,
  Modal,
  Select,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { FC, useEffect } from "react";
import { z } from "zod";
import { useCreateItemMutation } from "./service";

interface FormFields {
  name: string;
  location: "dry" | "wet" | "refrigerator" | "freezer";
  description: string;
  note: string;
}

export const ItemsPage: FC = () => {
  const mainButton = useMainButton();
  const createItemMutation = useCreateItemMutation();

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

      await createItemMutation.mutateAsync(value);

      mainButton.hideLoader();
      mainButton.enable();
    },
  });

  useEffect(() => {
    mainButton.setText("Create item");
    mainButton.show();
    mainButton.enable();

    mainButton.on("click", () => {
      console.log("click");
      form.handleSubmit();
    });
  }, []);

  return (
    <Modal trigger={<Button size="m">Open modal</Button>} open={true}>
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
      </form>
    </Modal>
  );
};
