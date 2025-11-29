import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import "@/styles/globals.css";

const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "2762a57b-faa4-41ce-9f16-abff9300e2c9";

export default function App({ Component, pageProps }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <Component {...pageProps} />
    </DynamicContextProvider>
  );
}
