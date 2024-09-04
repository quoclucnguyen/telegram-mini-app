import { DatePicker, Form } from "antd-mobile";
import dayjs from "dayjs";
import { useState } from "react";

export const DatePickerInput = () => {
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <Form.Item
      name="birthday"
      label="带清除图标的时间选择器"
      trigger="onConfirm"
      onClick={() => {
        setPickerVisible(true);
      }}
    >
      <DatePicker
        visible={pickerVisible}
        onClose={() => {
          setPickerVisible(false);
        }}
      >
        {(value) => (value ? dayjs(value).format("YYYY-MM-DD") : "")}
      </DatePicker>
    </Form.Item>
  );
};
