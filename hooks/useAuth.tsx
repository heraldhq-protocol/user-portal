"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { toast } from "sonner";

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

	// Load token from localStorage on mount
	useEffect(() => {
		const storedToken = localStorage.getItem("herald_portal_token");
		if (storedToken) {
			setToken(storedToken);
		}
	}, []);

	const logout = useCallback(() => {
		setToken(null);
		localStorage.removeItem("herald_portal_token");
		disconnect();
	}, [disconnect]);

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
				localStorage.setItem("herald_portal_token", data.token);
			} else {
				throw new Error("No token returned from server");
			}
		} catch (error) {
			console.error("Login failed:", error);
			toast.error(error instanceof Error ? error.message : "Authentication failed");
			logout();
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
