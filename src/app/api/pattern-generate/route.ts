import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  theme: string;
  style: string;
  colorScheme: string;
}

const STYLE_PROMPTS: Record<string, string> = {
  classic: "传统苗绣风格，纹样古朴，色彩以靛蓝、朱砂、古铜金为主，对称构图",
  modern: "现代苗绣风格，纹样简化几何化，色彩明快，留白较多",
  fantasy: "奇幻苗绣风格，纹样夸张变形，色彩绚丽梦幻，富有想象力",
};

const COLOR_PROMPTS: Record<string, string> = {
  indigo: "靛蓝主色调，配以朱砂红与古铜金点缀",
  vibrant: "高饱和色彩，朱砂红、翠绿、明黄交织",
  monochrome: "单色系，以深靛蓝为主，银白点缀",
  warm: "暖色调，朱砂、金黄、赭石为主",
};

export async function POST(req: NextRequest) {
  try {
    const { theme, style, colorScheme } = (await req.json()) as GenerateRequest;

    if (!theme || !theme.trim()) {
      return NextResponse.json(
        { error: "请输入纹样主题" },
        { status: 400 }
      );
    }

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.classic;
    const colorPrompt = COLOR_PROMPTS[colorScheme] || COLOR_PROMPTS.indigo;

    const prompt = `苗族刺绣纹样，主题：${theme}。${stylePrompt}。${colorPrompt}。纹样对称，富有民族特色，适合刺绣，平面装饰风格，无背景，高清细节。`;

    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt,
      size: "1024x1024",
    });

    const imageBase64 = response?.data?.[0]?.base64;

    if (!imageBase64) {
      throw new Error("生成失败：未返回图片数据");
    }

    const dataUrl = `data:image/png;base64,${imageBase64}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt,
      theme,
      style,
      colorScheme,
    });
  } catch (error) {
    console.error("Pattern generation error:", error);
    return NextResponse.json(
      {
        error: "纹样生成失败，请稍后重试",
        detail: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
