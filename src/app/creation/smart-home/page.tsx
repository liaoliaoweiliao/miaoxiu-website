import type { Metadata } from "next";
import { SmartHomeContent } from "./content";

export const metadata: Metadata = {
  title: "苗绣智能家居系列 | 苗绣·生生不息",
  description:
    "将苗绣纹样应用于抱枕、屏风、灯具等家居用品，结合智能感应，让传统纹样融入现代生活场景。",
};

export default function SmartHomePage() {
  return <SmartHomeContent />;
}
