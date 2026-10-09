import type { Metadata } from "next";
import { FashionContent } from "./content";

export const metadata: Metadata = {
  title: "苗绣跨界时装系列 | 苗绣·生生不息",
  description:
    "将苗绣纹样与现代时装结合，保留手工刺绣的温度，融入当代剪裁与面料，让苗绣走上国际时装周。",
};

export default function FashionPage() {
  return <FashionContent />;
}
