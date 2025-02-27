
# Land Renter

## Overview

Land Renter is a decentralized application (dApp) built on the Aptos blockchain, enabling users to rent and lease land assets in a secure and transparent manner. The frontend is developed using Vue.js, providing an intuitive and responsive user experience.

## Features

-   **Decentralized Land Leasing**: Rent and lease land assets securely using smart contracts on the Aptos blockchain.
    
-   **Smart Contract Integration**: Ensures trustless transactions between renters and landlords.
    
-   **User-Friendly Interface**: Developed with Vue.js for an intuitive and interactive experience.
    
-   **Secure & Transparent**: Blockchain-based transactions for enhanced security and transparency.
    
-   **Wallet Integration**: Supports Aptos-compatible wallets for seamless transactions.
    

## Tech Stack

-   **Blockchain**: Aptos
    
-   **Frontend**: Vue.js
    
-   **Smart Contracts**: Move (Aptos' smart contract language)
    
-   **Wallet Support**: Martian, Pontem, Petra, and other Aptos-compatible wallets
    

## Installation

### Prerequisites

-   Node.js (latest LTS version recommended)
    
-   Vue.js CLI
    
-   Aptos Wallet (e.g., Martian, Petra, Pontem)
    

### Setup Instructions

1.  Clone the repository:
    
    ```
    git clone https://github.com/lambang8856/land-renter.git
    cd land-renter
    ```
    
2.  Install dependencies:
    
    ```
    npm install
    ```
    
3.  Start the development server:
    
    ```
    npm run dev
    ```
    
4.  Open the application in your browser at `http://localhost:3000`
    

## Smart Contracts

The smart contracts for the Land Renter project are written in Move and deployed on the Aptos blockchain. The contracts handle land ownership, rental agreements, and payments securely.

### Deploying Smart Contracts

1.  Install the Aptos CLI:
    
    ```
    curl -sSf https://aptos.dev/install.sh | bash
    ```
    
2.  Initialize the Aptos account:
    
    ```
    aptos init
    ```
    
3.  Deploy the contract:
    
    ```
    aptos move publish --assume-yes
    ```
    

## Usage

1.  Connect your Aptos-compatible wallet.
    
2.  Browse available land listings.
    
3.  Rent or lease land using smart contract-powered transactions.
    
4.  Manage your rentals via the dashboard.
    

## Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
    
2.  Create a new branch for your feature or fix.
    
3.  Commit your changes and push them to your fork.
    
4.  Open a pull request.
    

## License

This project is licensed under the MIT License.
