import { SearchBar, Space, Tabs } from "antd-mobile";
import {
  ContentOutline,
  CouponOutline,
  FolderOutline,
} from "antd-mobile-icons";
import { useCallback, useEffect, useState } from "react";
import ItemsPageCategoryTab from "./ItemCategoryTab";
import { useCategoryTabFilterStore } from "./hook";
import { CategoryEnum } from "./interface";
import { useCountItemsByCategoryQuery } from "./service";

const ItemsPage = () => {
  const [activeKey, setActiveKey] = useState(CategoryEnum.FOODS);
  const { filter, setFilter } = useCategoryTabFilterStore();

  const countItemFoodsQuery = useCountItemsByCategoryQuery(
    CategoryEnum.FOODS,
    filter,
  );
  const countItemCosmeticsQuery = useCountItemsByCategoryQuery(
    CategoryEnum.COSMETICS,
    filter,
  );
  const countItemOthersQuery = useCountItemsByCategoryQuery(
    CategoryEnum.OTHERS,
    filter,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const debouncedSetSearchTerm = useCallback(
    (value: string) => {
      const timer = setTimeout(() => {
        setFilter(value);
      }, 300);

      return () => clearTimeout(timer);
    },
    [setFilter],
  );

  const handleChange = (value: string): void => {
    debouncedSetSearchTerm(value);
  };

  return (
    <div className="">
      <SearchBar
        placeholder="Search"
        style={{ "--border-radius": "0px" }}
        onChange={handleChange}
        onClear={() => {
          setFilter("");
        }}
      />

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
                <span>({countItemFoodsQuery.data})</span>
              </Space>
            ),
          },
          {
            key: CategoryEnum.COSMETICS,
            title: (
              <Space className="items-center">
                <ContentOutline /> Cosmetics
                <span>({countItemCosmeticsQuery.data})</span>
              </Space>
            ),
          },
          {
            key: CategoryEnum.OTHERS,
            title: (
              <Space className="items-center">
                <FolderOutline /> Others
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
              popupSubmitCb={() => {
                if (activeKey === CategoryEnum.FOODS) {
                  countItemFoodsQuery.refetch();
                }
                if (activeKey === CategoryEnum.COSMETICS) {
                  countItemCosmeticsQuery.refetch();
                }
                if (activeKey === CategoryEnum.OTHERS) {
                  countItemOthersQuery.refetch();
                }
              }}
            />
          </Tabs.Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default ItemsPage;
