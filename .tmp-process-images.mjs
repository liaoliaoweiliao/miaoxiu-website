import sharp from "sharp";
import path from "path";

const dir = "public/images";
const jobs = [
  ["Photographic__cinematic_close__2026-10-05T05-10-58.png", "hero-banner.jpg", 60],
  ["Ancient_Miao_embroidery_herita_2026-10-05T05-11-57.png", "history.jpg", 72],
  ["Extreme_macro_close_up_of_colo_2026-10-05T05-11-57.png", "patterns.jpg", 72],
  ["Close_up_of_hands_of_a_Chinese_2026-10-05T05-11-55.png", "craft.jpg", 72],
  ["Fusion_of_tradition_and_techno_2026-10-05T05-11-57.png", "innovation.jpg", 72],
  ["Dignified_portrait_of_an_elder_2026-10-05T05-11-53.png", "people.jpg", 72],
  ["Modern_fashion_design_with_Mia_2026-10-05T05-11-56.png", "creation.jpg", 72],
];

for (const [src, out, crop] of jobs) {
  const img = sharp(path.join(dir, src));
  const meta = await img.metadata();
  await img
    .extract({ left: 0, top: 0, width: meta.width, height: meta.height - crop })
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(dir, out));
  console.log(`${out}  <- ${meta.width}x${meta.height}`);
}

// 视频封面：使用作品截图作为海报
await sharp("../../04_作品截图/01_首页.jpg")
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(dir, "video-poster.jpg"));
console.log("video-poster.jpg done");
