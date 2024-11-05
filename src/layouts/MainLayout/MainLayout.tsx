import { Skeleton, TabBar } from "antd-mobile";
import {
  AppOutline,
  MessageOutline,
  SetOutline,
  UnorderedListOutline,
} from "antd-mobile-icons";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  console.log(pathname);

  const setRouteActive = (value: string) => {
    navigate(value);
  };

  const tabs = [
    {
      key: "items",
      title: "Items",
      icon: <UnorderedListOutline />,
    },
    {
      key: "lucky",
      title: "Lucky",
      icon: <AppOutline />,
    },
    {
      key: "message",
      title: "Message",
      icon: <MessageOutline />,
    },
    {
      key: "setting",
      title: "Setting",
      icon: <SetOutline />,
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex justify-center items-center">
        <React.Suspense
          fallback={
            <>
              <Skeleton.Title animated />
              <Skeleton.Paragraph animated />
            </>
          }
        >
          <div className="h-full w-full">
            <Outlet />
          </div>
        </React.Suspense>
      </div>

      <div className="flex-none border-t border-[--adm-color-border]">
        <TabBar
          activeKey={pathname.substring(1, pathname.length)}
          onChange={(value) => setRouteActive(value)}
        >
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default MainLayout;
