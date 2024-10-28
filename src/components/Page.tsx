import { backButton } from "@telegram-apps/sdk-react";
import { Analytics } from "@vercel/analytics/react";
import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Page({
  children,
  back = true,
}: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;
}>) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }
    backButton.hide();
  }, [back]);

  return (
    <>
      {children}
      <Analytics />
    </>
  );
}