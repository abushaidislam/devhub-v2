import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {ToolCard} from "@/components/tool-card";
import {categories,categoryDescriptions,tools} from "@/lib/tools";

export function generateStaticParams(){return categories.map(slug=>({slug:slug.toLowerCase()}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const category=categories.find(item=>item.toLowerCase()===slug);
  if(!category)return {};
  const items=tools.filter(tool=>tool.category===category);
  const description=`Browse ${items.length} free ${category.toLowerCase()} developer tools for focused, browser-based workflows.`;
  return {title:`${category} Developer Tools`,description,alternates:{canonical:`/categories/${slug}`},openGraph:{type:"website",url:`/categories/${slug}`,title:`${category} Developer Tools — DevHub`,description}};
}

export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const category=categories.find(c=>c.toLowerCase()===slug);
  if(!category)notFound();
  const items=tools.filter(t=>t.category===category);
  const categoryDescription=categoryDescriptions[category]??`Explore ${category.toLowerCase()} utilities for recurring developer workflows.`;
  return (
    <main>
      <SiteHeader/>
      <section className="page-hero">
        <div className="container">
          <span className="label">Category</span>
          <h1>{category}</h1>
          <p>{categoryDescription}</p>
        </div>
      </section>
      <section className="section" aria-labelledby={`${slug}-tools-title`}>
        <div className="container">
          <h2 id={`${slug}-tools-title`}>{category} tools for focused work</h2>
          <p>{items.length} browser-based utilities are available in this category. Choose a tool below to inspect its supported workflow and run the transformation locally.</p>
          <div className="tools-grid">
            {items.map(t=><ToolCard key={t.slug} tool={t}/>)}
          </div>
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
