import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { lineraAdapter } from '../lib/linera-adapter';

export default function ConnectWallet() {
    const { primaryWallet, setShowAuthFlow } = useDynamicContext();
    const [lineraData, setLineraData] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Connect to Linera when Dynamic wallet is available
    useEffect(() => {
        const connectToLinera = async () => {
            if (primaryWallet) {
                if (!lineraAdapter.isChainConnected()) {
                    try {
                        setIsConnecting(true);
                        const faucetUrl = 'https://faucet.testnet-conway.linera.net/';
                        const provider = await lineraAdapter.connect(primaryWallet, faucetUrl);
                        setLineraData({
                            chainId: provider.chainId,
                            address: provider.address
                        });
                    } catch (error) {
                        console.error("Failed to connect to Linera:", error);
                    } finally {
                        setIsConnecting(false);
                    }
                } else {
                    // Already connected, just sync state
                    const provider = lineraAdapter.getProvider();
                    setLineraData({
                        chainId: provider.chainId,
                        address: provider.address
                    });
                }
            } else if (!primaryWallet) {
                setLineraData(null);
                lineraAdapter.reset();
            }
        };

        connectToLinera();
    }, [primaryWallet]);

    if (primaryWallet && lineraData) {
        return (
            <div className="flex flex-col gap-3 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl min-w-[200px]">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Address</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                        <span className="text-white/90 font-mono text-sm">
                            {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
                        </span>
                    </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Chain ID</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                        <span className="text-white/90 font-mono text-sm">
                            {lineraData.chainId.slice(0, 6)}...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowAuthFlow(true)}
            disabled={isConnecting}
            className="relative px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-medium tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center gap-2">
                {isConnecting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting...</span>
                    </>
                ) : (
                    <>
                        <span>Connect Wallet</span>
                        <svg className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </>
                )}
            </span>
        </button>
    );
}   