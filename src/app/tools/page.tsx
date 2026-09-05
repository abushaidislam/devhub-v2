import type {Metadata} from "next";
import {SiteHeader} from "@/components/core/site-header";
import {SiteFooter} from "@/components/core/site-footer";
import {ToolSearch} from "@/components/tools/tool-search";
import {tools} from "@/lib/tools";

export const metadata:Metadata={
  title:"Developer Tools",
  description:`Browse ${tools.length} fast, private developer utilities for formatting, converting and generating data.`,
  alternates:{canonical:"/tools"},
  openGraph:{
    type:"website",
    url:"/tools",
    title:"Developer Tools — DevHub",
    description:`Browse ${tools.length} fast, private developer utilities for formatting, converting and generating data.`,
    images:[{url:"/opengraph-image",width:1200,height:630,alt:"Developer Tools — DevHub"}]
  },
  twitter:{
    card:"summary_large_image",
    title:"Developer Tools — DevHub",
    description:`Browse ${tools.length} fast, private developer utilities for formatting, converting and generating data.`,
    images:["/opengraph-image"]
  }
};

export default function ToolsPage(){
  return (
    <main>
      <SiteHeader/>
      <section className="page-hero">
        <div className="container">
          <span className="label">Toolkit</span>
          <h1>Tools for focused work.</h1>
          <p>Fast, private utilities for the tasks developers do every day.</p>
        </div>
      </section>
      <section className="section tools-section">
        <div className="container">
          <ToolSearch/>
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
