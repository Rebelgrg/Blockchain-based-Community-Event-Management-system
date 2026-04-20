# Community events (web UI)

React + Vite + wagmi/viem. Copy `.env.example` to `.env` when you deploy to Sepolia or use a non-default contract address.

## Run with local Hardhat

1. Terminal A — chain: `cd ..` (repo root) then `npx hardhat node`
2. Terminal B — contract: `npm run deploy:event:localhost` from repo root (with node running)
3. Terminal C — UI: `npm run dev` from this `web/` folder (or `npm run web:dev` from repo root)
4. Open the printed URL (usually `http://localhost:5173`). In MetaMask, add the **Localhost 8545** / chain ID **31337** network if prompted.

## Sepolia

Set `VITE_EVENT_MANAGEMENT_ADDRESS` or `VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA` in `.env` to your deployed contract, then restart `npm run dev`. Use a reliable `VITE_SEPOLIA_RPC_URL` for demos.

## Assignment notes (UX goals)

- **Transparency:** live block number in the header; step-by-step status when publishing (wallet → confirming → done); optional reference id for verification.
- **Wallet safety:** explicit “Connect your wallet” and short explainer; no signing except the transaction you trigger.
- **Plain language:** errors mapped to non-technical copy; networks labeled “Local practice” / “Sepolia test” instead of jargon.
