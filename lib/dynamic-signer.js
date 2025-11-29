import { isEthereumWallet } from "@dynamic-labs/ethereum";

export class DynamicSigner {
    constructor(dynamicWallet) {
        this.dynamicWallet = dynamicWallet;
    }

    async address() {
        return this.dynamicWallet.address;
    }

    async containsKey(owner) {
        const walletAddress = this.dynamicWallet.address;
        return owner.toLowerCase() === walletAddress.toLowerCase();
    }

    async sign(owner, value) {
        const address = owner;
        const primaryWallet = this.dynamicWallet.address;

        if (!primaryWallet || !owner) {
            throw new Error("No primary wallet found");
        }

        if (owner.toLowerCase() !== primaryWallet.toLowerCase()) {
            throw new Error("Owner does not match primary wallet");
        }

        try {
            const msgHex = `0x${uint8ArrayToHex(value)}`;

            // IMPORTANT: The value parameter is already pre-hashed, and the standard `signMessage`
            // method would hash it again, resulting in a double-hash. To avoid this, we bypass
            // the standard signing flow and use `personal_sign` directly on the wallet client.
            // DO NOT USE: this.dynamicWallet.signMessage(msgHex) - it would cause double-hashing

            // Note: First cast the wallet to an Ethereum wallet to get the wallet client
            if (!isEthereumWallet(this.dynamicWallet)) throw new Error();
            const walletClient = await this.dynamicWallet.getWalletClient();
            const signature = await walletClient.request({
                method: "personal_sign",
                params: [msgHex, address],
            });

            if (!signature) throw new Error("Failed to sign message");
            return signature;
        } catch (error) {
            console.error("Failed to sign message:", error);
            throw new Error(
                `Dynamic signature request failed: ${error?.message || error}`
            );
        }
    }
}

function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
