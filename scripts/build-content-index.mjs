// قبل از vite build: از مقاله‌ها و راهنماهای public/content یک فهرست سبک می‌سازد
// (متن کامل هر مقاله فقط وقتی همان صفحه باز می‌شود دانلود می‌شود تا سایت سنگین نشود)
import { readdir, readFile, writeFile } from "node:fs/promises";

const dir = (p) => new URL(`../public/content/${p}/`, import.meta.url);
const readAll = async (p) => {
  const files = (await readdir(dir(p))).filter((f) => f.endsWith(".json"));
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(new URL(f, dir(p)), "utf8"))));
};

const articles = (await readAll("articles"))
  .map(({ slug, topic, cluster, title, description, date, relatedCategory, readMinutes }) => ({ slug, topic, cluster, title, description, date, relatedCategory, readMinutes }))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug));
const guides = (await readAll("guides")).map(({ topic, title, description, h1 }) => ({ topic, title, description, h1 }));

await writeFile(new URL("../src/data/contentIndex.json", import.meta.url), JSON.stringify({ articles, guides }));
console.log(`content index: ${articles.length} مقاله، ${guides.length} راهنما`);
