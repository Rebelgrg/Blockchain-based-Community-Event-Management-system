# Event Management dApp

A blockchain-based community event platform built with Solidity, Hardhat, React, and Wagmi.

Users can:
- connect a wallet,
- create events on-chain,
- browse all events on the selected network,
- RSVP to active events,
- cancel events they organized.

The app focuses on clear wallet safety messaging and simple, non-technical UX.

## Features

- On-chain event creation with validation
- Event categories and participant limits
- RSVP flow with full/cancelled/past safeguards
- Organizer-only event cancellation
- Live network status (latest block heartbeat)
- Friendly transaction and wallet error messages
- Local Hardhat + Sepolia support

## Tech Stack

- **Smart contracts:** Solidity `0.8.28`, Hardhat 3, Viem
- **Frontend:** React 19, Vite, Wagmi, TanStack Query, TypeScript
- **Testing:** Hardhat Solidity tests + Node.js integration tests

## Project Structure

```text
event-dapp/
|-- contracts/
|   |-- EventManagement.sol
|   `-- Counter.sol
|-- scripts/
|   |-- deploy-event-management.ts
|   |-- create-event.ts
|   |-- read-events.ts
|   `-- constants.ts
|-- test/
|   |-- EventManagement.ts
|   `-- Counter.ts
|-- ignition/modules/
|   `-- EventManagement.ts
`-- web/
    |-- src/components/
    |-- src/lib/
    `-- package.json
```

## Prerequisites

- Node.js 18+
- npm
- MetaMask or another EVM wallet (for frontend usage)

## Installation

```bash
npm install
npm install --prefix web
```

## Environment Variables

Create a `.env` in the project root for Hardhat network credentials:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

Optional frontend variables (in `web/.env` or root env when using Vite):

```env
VITE_LOCAL_RPC_URL=http://127.0.0.1:8545
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
VITE_EVENT_MANAGEMENT_ADDRESS_LOCAL=0x...
VITE_EVENT_MANAGEMENT_ADDRESS_SEPOLIA=0x...
```

## Run Locally

1) Start a local chain:

```bash
npm run node
```

2) Deploy `EventManagement` to localhost:

```bash
npm run deploy:event:localhost
```

3) Start frontend:

```bash
npm run web:dev
```

4) Open:

[`http://localhost:5173`](http://localhost:5173)

## Deployment

### Sepolia (manual script)

```bash
npm run deploy:event:sepolia
```

### Localhost (Ignition)

```bash
npm run ignition:event:localhost
```

## Scripts

Root scripts:
- `npm run build` - compile contracts
- `npm run test` - run all contract tests
- `npm run node` - run local Hardhat node
- `npm run deploy:event:localhost` - deploy to localhost
- `npm run deploy:event:sepolia` - deploy to Sepolia
- `npm run web:dev` - run frontend dev server
- `npm run web:build` - build frontend

Interaction helpers:
- `npx hardhat run scripts/create-event.ts --network localhost`
- `npx hardhat run scripts/read-events.ts`

## Contract Overview

`EventManagement` stores events in a mapping by incremental `id`.

Each event tracks:
- title
- description
- date (unix timestamp)
- organizer
- active status
- category
- max participants
- current participants

Core functions:
- `createEvent(...)`
- `registerForEvent(eventId)`
- `cancelEvent(eventId)`
- `getEvent(eventId)`

Emitted events:
- `EventCreated`
- `EventRegistered`
- `EventCancelled`

## Testing

```bash
npm test
```

This runs:
- Solidity tests (Foundry-style in Hardhat)
- Node.js integration tests for contract behavior

## Notes

- Local default contract address in scripts and frontend is aligned for first deploy on a fresh `hardhat node`.
- If you deploy multiple times, set explicit addresses through env vars to avoid mismatches.
- Never commit real private keys. Use test accounts only.

## License

ISC
# event-management-dapp
Blockchain-based decentralized event management system
=======
# Blockchain-Based Community Event Management System

A decentralized application (dApp) for transparent and secure community event management built on Ethereum. Users can create events, view all events, register for events, and cancel events they organize.

## Features

- **Decentralized Event Creation**: Create community events with title, description, and date
- **Transparent Event Listing**: View all events stored immutably on the blockchain
- **Event Registration**: RSVP for active upcoming events
- **Event Cancellation**: Organizers can cancel their events
- **Wallet Integration**: Connect MetaMask or other Web3 wallets
- **Multi-Network Support**: Works on local Hardhat network and Sepolia testnet

## Tech Stack

### Blockchain
- **Solidity**: Smart contract language
- **Hardhat**: Development environment and testing framework
- **Viem**: Modern Ethereum library for TypeScript
- **Ethers.js**: Ethereum interaction library

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Wagmi**: Web3 wallet connection hooks
- **TanStack React Query**: Data fetching and caching
- **TypeScript**: Type-safe JavaScript

### Testing
- **Hardhat Test Framework**: Contract and integration tests
- **Node.js Test Runner**: Native Node.js testing

## Smart Contract

The `EventManagement` contract provides:

- Event creation with validation
- Event listing and details retrieval
- User registration for events
- Event cancellation by organizers
- Proper access controls and state management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rebelgrg/Blockchain-based-Community-Event-Management-system.git
cd event-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd web
npm install
cd ..
```

### Running Locally

1. Start Hardhat node:
```bash
npm run node
```

2. Deploy contracts:
```bash
npm run deploy:event:localhost
```

3. Start frontend:
```bash
npm run web:dev
```

4. Open http://localhost:5173 in your browser

### Testing

Run all tests:
```bash
npm test
```

### Deployment to Sepolia

1. Set environment variables:
```bash
export SEPOLIA_RPC_URL="your-rpc-url"
export SEPOLIA_PRIVATE_KEY="your-private-key"
```

2. Deploy to Sepolia:
```bash
npm run deploy:event:sepolia
```

3. Update frontend config with deployed contract address

## Project Structure

```
event-dapp/
├── contracts/           # Solidity smart contracts
├── scripts/            # Deployment and interaction scripts
├── test/               # Contract tests
├── web/                # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities and configs
├── hardhat.config.ts   # Hardhat configuration
└── package.json
```

## Usage

1. Connect your Web3 wallet
2. Create an event with title, description, and date
3. View all events in the list
4. Register for events you're interested in
5. As an organizer, cancel events if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

ISC# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
