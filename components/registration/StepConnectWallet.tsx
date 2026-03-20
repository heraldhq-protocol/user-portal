'use client';

import { motion } from 'motion/react';
import { useWallet, WalletNotSelectedError } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import {
  PhantomWalletName,
  SolflareWalletName,
  LedgerWalletName,
  CoinbaseWalletName,
} from '@solana/wallet-adapter-wallets';
import type { WalletName } from '@solana/wallet-adapter-base';
import {
  WalletConnectionError,
  WalletNotConnectedError,
  WalletPublicKeyError,
  WalletTimeoutError,
} from '@solana/wallet-adapter-base';
import { useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WalletConnected {
  name: string;
  color: string;
  walletName: WalletName;
}

const WALLETS: Array<WalletConnected> = [
  { name: 'Phantom', color: '#AB9FF2', walletName: PhantomWalletName },
  { name: 'Solflare', color: '#FC7227', walletName: SolflareWalletName },
  { name: 'Coinbase', color: '#E33B3B', walletName: CoinbaseWalletName },
  { name: 'Ledger', color: '#999999', walletName: LedgerWalletName },
];

interface StepConnectWalletProps {
  onConnected: (address: string | undefined) => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export function StepConnectWallet({
  onConnected,
  onNext,
  showNextButton = true,
}: StepConnectWalletProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletConnected | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionAttemptRef = useRef<string | null>(null);

  const {
    select,
    connect,
    connected,
    disconnect,
    publicKey,
    wallet,
    connecting: walletConnecting,
  } = useWallet();

  const getActive = useCallback(
    (walletName: unknown) => WALLETS.find((wallet) => wallet.walletName === walletName),
    [],
  );

  // Sync local state with wallet adapter state when connection changes
  useEffect(() => {
    if (connected && publicKey && wallet?.adapter?.name) {
      const activeWallet = WALLETS.find((w) => w.walletName === wallet.adapter.name);

      if (activeWallet && (!selectedWallet || selectedWallet.name !== activeWallet.name)) {
        setSelectedWallet(activeWallet);
      }

      // Notify parent of connection
      onConnected(publicKey.toString());
      setIsConnecting(false);
      connectionAttemptRef.current = null;
    } else if (!connected && !walletConnecting && !isConnecting) {
      // Reset when disconnected and not in the middle of connecting
      if (selectedWallet) {
        setSelectedWallet(null);
        onConnected(undefined);
      }
      connectionAttemptRef.current = null;
    }
  }, [connected, publicKey, wallet, selectedWallet, onConnected, walletConnecting, isConnecting]);

  const handleConnect = useCallback(
    async (walletName: unknown) => {
      const activeWallet = getActive(walletName);

      if (!activeWallet) {
        toast.error('Wallet not found');
        return;
      }

      // Prevent multiple connection attempts to the same wallet
      if (connectionAttemptRef.current === activeWallet.name && isConnecting) {
        console.log('Connection already in progress');
        return;
      }

      // If trying to connect to the same wallet that's already connected, do nothing
      if (connected && selectedWallet?.name === activeWallet.name) {
        toast.info(`${activeWallet.name} is already connected`);
        return;
      }

      setIsConnecting(true);
      connectionAttemptRef.current = activeWallet.name;

      try {
        // If already connected to a different wallet, disconnect first
        if (connected) {
          console.log('Disconnecting from current wallet...');
          await disconnect();
          // Small delay to ensure disconnect is complete
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // Select the wallet
        console.log(`Selecting wallet: ${activeWallet.name}`);
        select(activeWallet.walletName);

        // Small delay to ensure wallet is selected
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Attempt to connect
        console.log(`Connecting to ${activeWallet.name}...`);
        await connect();

        // Success - toast will be shown by useEffect when connected state updates
        toast.success(`${activeWallet.name} connected successfully`);
      } catch (error: unknown) {
        console.error('Connection error:', error);
        setSelectedWallet(null);
        connectionAttemptRef.current = null;

        if (error instanceof Error) {
          // Check specific error types from wallet adapter
          if (error instanceof WalletNotSelectedError) {
            toast.error(`Please ensure ${activeWallet.name} extension is installed and try again`);
          } else if (error instanceof WalletConnectionError) {
            if (error.message?.includes('rejected') || error.message?.includes('denied')) {
              toast.error(`Connection rejected by ${activeWallet.name}`);
            } else {
              toast.error(
                `Failed to connect to ${activeWallet.name}. Please check if the wallet is unlocked.`,
              );
            }
          } else if (error instanceof WalletTimeoutError) {
            toast.error(`Connection timeout. Please try again.`);
          } else if (error instanceof WalletNotConnectedError) {
            toast.error(`Please connect your ${activeWallet.name} wallet first.`);
          } else if (error instanceof WalletPublicKeyError) {
            toast.error(`Unable to retrieve public key from ${activeWallet.name}.`);
          } else {
            // Generic error handling
            toast.error(
              `Failed to connect ${activeWallet.name}: ${error.message || 'Unknown error'}`,
            );
          }
        } else {
          // Handle non-Error objects
          toast.error(`Failed to connect ${activeWallet.name}. Please try again.`);
        }

        setIsConnecting(false);
      }
    },
    [select, connect, disconnect, connected, selectedWallet, getActive, isConnecting],
  );

  const handleDisconnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await disconnect();
      setSelectedWallet(null);
      connectionAttemptRef.current = null;
      toast.info('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect');
    } finally {
      setIsConnecting(false);
    }
  }, [disconnect]);

  const isConnected = connected && !!publicKey;

  const handleNext = () => {
    if (isConnected && onNext) {
      onNext();
    } else {
      toast.error('Please connect a wallet first');
    }
  };

  return (
    <div>
      <h2 className="text-[26px] font-extrabold tracking-tight">
        {isConnected ? 'Wallet Connected' : 'Connect your wallet'}
      </h2>
      <p className="text-text-muted text-sm mb-7 leading-relaxed">
        {isConnected
          ? `Connected to ${selectedWallet?.name || 'wallet'}: ${publicKey?.toString().slice(0, 6)}...${publicKey?.toString().slice(-4)}`
          : 'Your wallet is your identity. No username or password needed.'}
      </p>

      {/* Display connected wallet info with disconnect option */}
      {isConnected && selectedWallet && (
        <div className="mb-5 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
                style={{ background: selectedWallet.color }}
              >
                {selectedWallet.name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedWallet.name}</p>
                <p className="text-xs text-text-muted font-mono">
                  {publicKey?.toString().slice(0, 8)}...
                  {publicKey?.toString().slice(-8)}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>
      )}

      {/* Wallet grid - always visible */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {WALLETS.map((w) => {
          const isCurrentWallet = isConnected && selectedWallet?.name === w.name;
          const isDisabled = isConnecting || (isConnected && isCurrentWallet);

          return (
            <motion.button
              key={w.name}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              onClick={() => !isDisabled && handleConnect(w.walletName)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-2.5 border rounded-xl p-4 cursor-pointer transition-all duration-150',
                isCurrentWallet
                  ? 'bg-emerald-500/20 border-emerald-500/50 cursor-default'
                  : 'bg-card border-border hover:border-border-2 hover:bg-card/80',
                isConnecting && 'opacity-50 cursor-not-allowed',
              )}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
                style={{ background: w.color }}
              >
                {w.name[0]}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm text-text-secondary">{w.name}</span>
                {isCurrentWallet && <span className="text-xs text-emerald-500">Connected</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="mb-4 text-xs text-text-muted text-center">
        {isConnected
          ? 'Click on a different wallet to switch, or click Disconnect above'
          : 'Select a wallet to connect'}
      </div>

      {/* Loading state */}
      {isConnecting && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-blue-500">
              {selectedWallet ? `Connecting to ${selectedWallet.name}...` : 'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Next Button */}
      {showNextButton && isConnected && !isConnecting && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full mt-6 py-3 bg-teal hover:bg-teal/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Continue to Email →
        </motion.button>
      )}

      {/* Trust message */}
      <div className="px-4 py-3 bg-teal/5 rounded-[10px] border border-teal/12 mt-6">
        <p className="text-xs text-teal leading-relaxed">
          Herald only uses your wallet for identity. We never request transaction fees at this step.
        </p>
      </div>
    </div>
  );
}
