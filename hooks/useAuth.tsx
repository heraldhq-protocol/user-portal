"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { toast } from "sonner";
import { safeStorage } from "@/lib/storage";
import { identify } from "@adtivity/adtivity-sdk";

/**
 * Basic JWT payload decoder.
 */
export function decodePayload(token: string): Record<string, never> | null {
	try {
		const base64Url = token.split(".")[1];
		if (!base64Url) return null;
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join("")
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		console.error("JWT Decode failed:", e);
		return null;
	}
}

interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	login: () => Promise<void>;
	logout: () => void;
	isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const { publicKey, signMessage, disconnect } = useWallet();

	// Load token from safeStorage on mount
	useEffect(() => {
		const storedToken = safeStorage.getItem("herald_portal_token");
		if (storedToken) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setToken(storedToken);
		}
	}, []);

	const logout = useCallback(() => {
		setToken(null);
		safeStorage.removeItem("herald_portal_token");
		disconnect();
	}, [disconnect]);

	useEffect(() => {
		const handleUnauthorized = () => {
			console.log("Unauthorized request intercepted, logging out...");
			setToken(null);
			safeStorage.removeItem("herald_portal_token");
			disconnect();
			// Removing window.location.reload() to prevent infinite redirect loops.
		};

		window.addEventListener("herald:unauthorized", handleUnauthorized);
		return () => window.removeEventListener("herald:unauthorized", handleUnauthorized);
	}, [disconnect]);

	// Auto-logout if wallet changes and doesn't match the token
	useEffect(() => {
		if (token && publicKey) {
			const payload = decodePayload(token);
			const walletPubkeyInToken = payload?.walletPubkey;

			if (walletPubkeyInToken && walletPubkeyInToken !== publicKey.toBase58()) {
				console.log("Wallet mismatch detected, logging out...");
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setToken(null);
				safeStorage.removeItem("herald_portal_token");
				// Note: we don't call disconnect() here as the user just connected a new wallet
			}
		}
	}, [token, publicKey]);

	// Identify the connected wallet in Adtivity
	useEffect(() => {
		if (publicKey && process.env.NEXT_PUBLIC_ADTIVITY_API_KEY) {
			try {
				identify(publicKey.toBase58(), {
					walletAddress: publicKey.toBase58(),
				});
			} catch (err) {
				console.warn("Adtivity identify failed", err);
			}
		}
	}, [publicKey]);

	const login = async () => {
		if (!publicKey || !signMessage) {
			toast.error("Wallet not connected or does not support message signing");
			return;
		}

		setIsLoggingIn(true);
		try {
			const walletPubkey = publicKey.toBase58();
			const timestamp = Math.floor(Date.now() / 1000);
			const message = `Sign in to Herald Dashboard\nWallet: ${walletPubkey}\nTimestamp: ${timestamp}`;
			const messageBytes = new TextEncoder().encode(message);

			const signature = await signMessage(messageBytes);
			const signatureBase58 = bs58.encode(signature);

			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
			const response = await fetch(`${apiUrl}/auth/portal-token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					walletPubkey,
					signature: signatureBase58,
					message,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to authenticate with server");
			}

			const data = await response.json();
			if (data.token) {
				setToken(data.token);
				safeStorage.setItem("herald_portal_token", data.token);
			} else {
				throw new Error("No token returned from server");
			}
		} catch (error) {
			console.error("Login failed:", error);
			const err = error as { message?: string; name?: string };
			const isRejection = 
				err?.message?.toLowerCase().includes("user rejected") || 
				err?.message?.toLowerCase().includes("declined") ||
				err?.name === "WalletSignMessageError";
			
			const friendlyMessage = isRejection 
				? "You rejected the signature request. Please try again." 
				: (error instanceof Error ? error.message : "Authentication failed");

			toast.error(friendlyMessage);
			setToken(null);
			safeStorage.removeItem("herald_portal_token");
			
			// Only disconnect the wallet on real non-rejection failures
			if (!isRejection) {
				disconnect();
			}
			throw error;
		} finally {
			setIsLoggingIn(false);
		}
	};

	const value = {
		token,
		isAuthenticated: !!token,
		login,
		logout,
		isLoggingIn,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
