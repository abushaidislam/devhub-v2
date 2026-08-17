import type {MetadataRoute} from "next";import {site} from "@/lib/site";
export default function manifest():MetadataRoute.Manifest{return {id:"/",name:"DevHub Toolkit",short_name:"DevHub",description:site.description,start_url:"/dashboard",scope:"/",display:"standalone",background_color:"#000000",theme_color:"#000000",categories:["developer","productivity","utilities"],icons:[{src:"/icon.png",sizes:"512x512",type:"image/png",purpose:"any"},{src:"/icon-maskable.png",sizes:"512x512",type:"image/png",purpose:"maskable"},{src:"/favicon.png",sizes:"64x64",type:"image/png"}]}}

export const dynamic="force-static";
