import { Space, Tabs } from "antd-mobile";
import {
  ContentOutline,
  CouponOutline,
  FolderOutline,
} from "antd-mobile-icons";
import { useState } from "react";
import ItemsPageCategoryTab from "./ItemCategoryTab";
import { CategoryEnum } from "./interface";

const ItemsPage = () => {
  const [activeKey, setActiveKey] = useState(CategoryEnum.FOODS);

  return (
    <Tabs
      style={{
        "--title-font-size": "14px",
        "--content-padding": "0px",
      }}
      activeLineMode="auto"
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key as CategoryEnum)}
    >
      {[
        {
          key: CategoryEnum.FOODS,
          title: (
            <Space className="items-center">
              <CouponOutline /> Foods
            </Space>
          ),
        },
        {
          key: CategoryEnum.COSMETICS,
          title: (
            <Space className="items-center">
              <ContentOutline /> Cosmetics
            </Space>
          ),
        },
        {
          key: CategoryEnum.OTHERS,
          title: (
            <Space className="items-center">
              <FolderOutline /> Others
            </Space>
          ),
        },
      ].map(({ key, title }) => (
        <Tabs.Tab key={key} title={title}>
          <ItemsPageCategoryTab
            key={key}
            category={key}
            activeKey={activeKey}
          />
        </Tabs.Tab>
      ))}
    </Tabs>
  );
};

export default ItemsPage;
