/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCAL_RPC_URL?: string;
  readonly VITE_SEPOLIA_RPC_URL?: string;
  readonly VITE_EVENT_MANAGEMENT_ADDRESS?: `0x${string}`;
  readonly VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA?: `0x${string}`;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
