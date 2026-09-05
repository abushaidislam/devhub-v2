import type {MetadataRoute} from "next";
import {categories,tools} from "@/lib/tools";
import {site} from "@/lib/site";

export default function sitemap():MetadataRoute.Sitemap{
  const trust=["/privacy","/security","/ai-data-policy","/accessibility","/docs","/changelog"];
  const routes=[
    "",
    "/tools",
    ...trust,
    ...categories.map(category=>`/categories/${category.toLowerCase()}`),
    ...tools.map(tool=>`/tools/${tool.slug}`)
  ];
  const now = new Date();
  return routes.map(route=>({
    url:`${site.url}${route}`,
    lastModified: now,
    changeFrequency:route.startsWith("/tools/")?"monthly":"weekly",
    priority:route===""?1:route==="/tools"?.9:.7
  }));
}
export const dynamic="force-static";
