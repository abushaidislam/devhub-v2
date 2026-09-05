import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {DashboardShell} from "@/components/dashboard/dashboard-shell";
import {FavoriteButton} from "@/components/dashboard/favorite-button";
import {JsonLd} from "@/components/core/json-ld";
import {NextActions} from "@/components/tools/next-actions";
import {ToolRuntime} from "@/components/tools/tool-runtime";
import {getTool,tools} from "@/lib/tools";
import {site} from "@/lib/site";
import styles from "./tool-page.module.css";

export function generateStaticParams(){return tools.map(({slug})=>({slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const tool=getTool(slug);
  return tool?{
    title:tool.name,
    description:tool.metaDescription,
    alternates:{canonical:`/tools/${slug}`},
    openGraph:{
      title:`${tool.name} — DevHub`,
      description:tool.metaDescription,
      url:`/tools/${slug}`,
      type:"website",
      images:[{url:"/opengraph-image",width:1200,height:630,alt:`${tool.name} — DevHub`}]
    },
    twitter:{
      card:"summary_large_image",
      title:`${tool.name} — DevHub`,
      description:tool.metaDescription,
      images:["/opengraph-image"]
    }
  }:{};
}

export default async function ToolPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const tool=getTool(slug);
  if(!tool)notFound();
  const jsonLd={"@context":"https://schema.org","@type":"SoftwareApplication",name:tool.name,url:`${site.url}/tools/${tool.slug}`,description:tool.metaDescription,applicationCategory:"DeveloperApplication",operatingSystem:"Any",isAccessibleForFree:true,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}};
  const breadcrumbJsonLd={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:site.url},{"@type":"ListItem",position:2,name:"Tools",item:`${site.url}/tools`},{"@type":"ListItem",position:3,name:tool.category,item:`${site.url}/categories/${tool.category.toLowerCase()}`},{"@type":"ListItem",position:4,name:tool.name,item:`${site.url}/tools/${tool.slug}`}]};
  return <DashboardShell activeSlug={tool.slug}><JsonLd data={jsonLd}/><JsonLd data={breadcrumbJsonLd}/><header className={styles.context} aria-label={`${tool.category}: ${tool.description}`}><div className={styles.contextContent}><div className={styles.contextLine}><span className="label">{tool.category}</span><span className={styles.separator} aria-hidden="true">/</span><p>{tool.description}</p></div></div><FavoriteButton slug={tool.slug}/></header><ToolRuntime slug={tool.slug} name={tool.name}/><section className={styles.seoContent} aria-labelledby="tool-guide-title"><h2 id="tool-guide-title">Tool overview</h2><p>{tool.seoSummary}</p><h3>What this tool supports</h3><ul>{tool.seoPoints.map(point=><li key={point}>{point}</li>)}</ul></section><NextActions currentSlug={tool.slug}/></DashboardShell>;
}
