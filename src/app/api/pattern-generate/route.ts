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

const COLOR_MAP: Record<string, [string, string, string]> = {
  indigo: ["#1e3a5f", "#c1272d", "#d4a04c"],
  vibrant: ["#c1272d", "#2d8659", "#f4c430"],
  monochrome: ["#1e3a5f", "#c0c0c0", "#ffffff"],
  warm: ["#c1272d", "#d4a04c", "#8b4513"],
};

/**
 * 离线示例纹样生成器：当未配置 Z.ai API Key（AI 服务不可用）时，
 * 返回一个基于传统苗绣美学（同心圆 + 放射纹 + 中心花蕊）的矢量 SVG，
 * 保证「AI 纹样生成器」交互始终可用、不会 500。
 */
function buildFallbackSvg(theme: string, colors: [string, string, string]): string {
  const [c1, c2, c3] = colors;
  const rings = [220, 165, 110, 55].map((r) => `<circle r="${r}"/>`).join("");
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const x = (Math.cos(a) * 250).toFixed(1);
    const y = (Math.sin(a) * 250).toFixed(1);
    rays += `<path d="M0 0 L ${x} ${y}"/>`;
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">` +
    `<rect width="800" height="800" fill="#f5f0e6"/>` +
    `<g transform="translate(400 400)" fill="none" stroke="${c1}" stroke-width="6">${rings}</g>` +
    `<g transform="translate(400 400)" fill="none" stroke="${c2}" stroke-width="4">${rays}</g>` +
    `<g transform="translate(400 400)" fill="${c3}" opacity="0.9"><circle r="34"/></g>` +
    `<text x="400" y="745" text-anchor="middle" font-family="serif" font-size="38" fill="${c1}">${theme}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

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
    const colors = COLOR_MAP[colorScheme] || COLOR_MAP.indigo;

    const prompt = `苗族刺绣纹样，主题：${theme}。${stylePrompt}。${colorPrompt}。纹样对称，富有民族特色，适合刺绣，平面装饰风格，无背景，高清细节。`;

    let imageUrl: string;
    let fallback = false;

    try {
      const zai = await ZAI.create();
      const response = await zai.images.generations.create({
        prompt,
        size: "1024x1024",
      });
      const imageBase64 = response?.data?.[0]?.base64;
      if (!imageBase64) throw new Error("生成失败：未返回图片数据");
      imageUrl = `data:image/png;base64,${imageBase64}`;
    } catch (genErr) {
      console.warn(
        "[pattern-generate] AI 服务不可用，使用离线示例纹样：",
        genErr instanceof Error ? genErr.message : genErr
      );
      fallback = true;
      imageUrl = buildFallbackSvg(theme, colors);
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      theme,
      style,
      colorScheme,
      fallback,
    });
  } catch (error) {
    console.error("Pattern generation error:", error);
    return NextResponse.json(
      {
        error: "请求解析失败，请稍后重试",
        detail: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
