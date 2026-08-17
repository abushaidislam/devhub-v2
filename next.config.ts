import type { NextConfig } from "next";

const securityHeaders = [
	{key: "X-Content-Type-Options", value: "nosniff"},
	{key: "X-Frame-Options", value: "DENY"},
	{key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
	{key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()"},
];

// Lovable's preview pipeline serves a static `dist/` bundle. Only that pipeline
// sets LOVABLE_STATIC_EXPORT=1; normal `next build` / `next start` stay on .next.
const staticExport = process.env["LOVABLE_STATIC_EXPORT"] === "1";

const nextConfig: NextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	experimental: {optimizePackageImports: ["lucide-react"]},
	...(staticExport
		? {output: "export" as const, images: {unoptimized: true}}
		: {
				async headers() {
					return [{source: "/(.*)", headers: securityHeaders}];
				},
			}),
};

export default nextConfig;
