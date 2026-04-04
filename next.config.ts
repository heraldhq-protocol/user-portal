import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "de.superteam.fun",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "solana.org",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "solana.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
