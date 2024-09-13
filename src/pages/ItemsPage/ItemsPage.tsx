import { Space, Tabs } from "antd-mobile";
import {
  ContentOutline,
  CouponOutline,
  FolderOutline,
} from "antd-mobile-icons";
import { useEffect, useState } from "react";
import ItemsPageCategoryTab from "./ItemCategoryTab";
import { CategoryEnum } from "./interface";
import { useCountItemsByCategoryQuery } from "./service";

const ItemsPage = () => {
  const [activeKey, setActiveKey] = useState(CategoryEnum.FOODS);

  const countItemFoodsQuery = useCountItemsByCategoryQuery(CategoryEnum.FOODS);
  const countItemCosmeticsQuery = useCountItemsByCategoryQuery(
    CategoryEnum.COSMETICS,
  );
  const countItemOthersQuery = useCountItemsByCategoryQuery(
    CategoryEnum.OTHERS,
  );

  useEffect(() => {
    if (activeKey === CategoryEnum.FOODS) {
      countItemFoodsQuery.refetch();
    }
    if (activeKey === CategoryEnum.COSMETICS) {
      countItemCosmeticsQuery.refetch();
    }
    if (activeKey === CategoryEnum.OTHERS) {
      countItemOthersQuery.refetch();
    }
  }, [
    activeKey,
    countItemCosmeticsQuery,
    countItemFoodsQuery,
    countItemOthersQuery,
  ]);

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
              <CouponOutline /> Foods <span>({countItemFoodsQuery.data})</span>
            </Space>
          ),
        },
        {
          key: CategoryEnum.COSMETICS,
          title: (
            <Space className="items-center">
              <ContentOutline /> Cosmetics{" "}
              <span>({countItemCosmeticsQuery.data})</span>
            </Space>
          ),
        },
        {
          key: CategoryEnum.OTHERS,
          title: (
            <Space className="items-center">
              <FolderOutline /> Others{" "}
              <span>({countItemOthersQuery.data})</span>
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
