import type { Metadata } from "next";
import { PatternLibraryContent } from "./content";

export const metadata: Metadata = {
  title: "苗绣数字纹样库 | 苗绣·生生不息",
  description:
    "将传统苗绣纹样矢量化、参数化，构建可检索、可生成的纹样数据库，为设计师与研究者提供数字资源。",
};

export default function PatternLibraryPage() {
  return <PatternLibraryContent />;
}
