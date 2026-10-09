import type { Metadata } from "next";
import { ArPicturebookContent } from "./content";

export const metadata: Metadata = {
  title: "苗绣AR互动绘本 | 苗绣·生生不息",
  description:
    "以AR技术呈现苗绣纹样的故事与寓意，扫描绣品即可观看纹样动画与文化解读，让儿童与青少年亲近非遗。",
};

export default function ArPicturebookPage() {
  return <ArPicturebookContent />;
}
