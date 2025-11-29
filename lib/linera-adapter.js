import initLinera, {
    Faucet,
    Client,
} from "@linera/client";
import { DynamicSigner } from "./dynamic-signer";

export class LineraAdapter {
    constructor() {
        this.provider = null;
        this.application = null;
        this.wasmInitPromise = null;
        this.connectPromise = null;
        this.onConnectionChange = undefined;
    }

    static getInstance() {
        if (!LineraAdapter.instance) LineraAdapter.instance = new LineraAdapter();
        return LineraAdapter.instance;
    }

    async connect(dynamicWallet, rpcUrl) {
        if (this.provider) return this.provider;
        if (this.connectPromise) return this.connectPromise;

        if (!dynamicWallet) {
            throw new Error("Dynamic wallet is required for Linera connection");
        }

        try {
            this.connectPromise = (async () => {
                const { address } = dynamicWallet;
                console.log("🔗 Connecting with Dynamic wallet:", address);

                try {
                    if (!this.wasmInitPromise) this.wasmInitPromise = initLinera();
                    await this.wasmInitPromise;
                    console.log("✅ Linera WASM modules initialized successfully");
                } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e);
                    if (msg.includes("storage is already initialized")) {
                        console.warn(
                            "⚠️ Linera storage already initialized; continuing without re-init"
                        );
                    } else {
                        throw e;
                    }
                }

                const faucet = new Faucet(rpcUrl);
                const wallet = await faucet.createWallet();
                const chainId = await faucet.claimChain(wallet, address);

                const signer = new DynamicSigner(dynamicWallet);
                const client = new Client(wallet, signer);
                console.log("✅ Linera wallet created successfully!");

                this.provider = {
                    client,
                    wallet,
                    faucet,
                    chainId,
                    address: dynamicWallet.address,
                };

                this.onConnectionChange?.();
                return this.provider;
            })();

            const provider = await this.connectPromise;
            return provider;
        } catch (error) {
            console.error("Failed to connect to Linera:", error);
            throw new Error(
                `Failed to connect to Linera network: ${error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            this.connectPromise = null;
        }
    }

    async setApplication(appId) {
        if (!this.provider) throw new Error("Not connected to Linera");
        if (!appId) throw new Error("Application ID is required");

        const application = await this.provider.client
            .frontend()
            .application(appId);

        if (!application) throw new Error("Failed to get application");
        console.log("✅ Linera application set successfully!");
        this.application = application;
        this.onConnectionChange?.();
    }

    async queryApplication(query) {
        if (!this.application) throw new Error("Application not set");

        const result = await this.application.query(JSON.stringify(query));
        const response = JSON.parse(result);

        console.log("✅ Linera application queried successfully!");
        return response;
    }

    getProvider() {
        if (!this.provider) throw new Error("Provider not set");
        return this.provider;
    }

    getFaucet() {
        if (!this.provider?.faucet) throw new Error("Faucet not set");
        return this.provider.faucet;
    }

    getWallet() {
        if (!this.provider?.wallet) throw new Error("Wallet not set");
        return this.provider.wallet;
    }

    getApplication() {
        if (!this.application) throw new Error("Application not set");
        return this.application;
    }

    isChainConnected() {
        return this.provider !== null;
    }

    isApplicationSet() {
        return this.application !== null;
    }

    onConnectionStateChange(callback) {
        this.onConnectionChange = callback;
    }

    offConnectionStateChange() {
        this.onConnectionChange = undefined;
    }

    reset() {
        this.application = null;
        this.provider = null;
        this.connectPromise = null;
        this.onConnectionChange?.();
    }
}

// Export singleton instance
export const lineraAdapter = LineraAdapter.getInstance();
