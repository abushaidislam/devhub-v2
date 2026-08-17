"use client";
import {useEffect} from "react";
/** Registers the offline app-shell service worker (ADR-016) in production builds only. Renders nothing. */
export function ServiceWorkerRegistration(){
	useEffect(()=>{
		if(process.env.NODE_ENV!=="production")return;
		if(!("serviceWorker" in navigator))return;
		navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{});
	},[]);
	return null;
}
