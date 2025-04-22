# Missing Link

A decentralized application (DApp) built on Ethereum to help communities report, track, and assist in finding missing individuals. The platform connects concerned citizens, family members, and investigators in a transparent, tamper-proof way using blockchain technology.


## 📌 Overview

Every year, thousands of people go missing and their cases often get lost due to poor tracking, lack of transparency, or inefficiency in traditional systems. This DApp aims to solve that by offering a secure, blockchain-powered platform to:

- Report missing persons
- View active missing cases
- Book investigation appointments
- Track ongoing case progress
- Engage volunteers and the community

Built using **Solidity**, **React**, **Web3.js/Ethers.js**, and **Truffle**, the application ensures security, accountability, and decentralization.


## 🚀 Features

- 🔐 **Decentralized Reporting**  
  Users can submit detailed reports about missing individuals, including personal information, last known location, and contact info.

- 🧑‍🤝‍🧑 **Community Transparency**  
  All reported cases are publicly viewable, increasing the chances of someone recognizing or helping.

- 📆 **Book Investigation Appointments**  
  Reporters can schedule slots to meet or consult with investigators, tracked securely via smart contracts.

- 👮 **Investigator Dashboard**  
  Investigators can view upcoming appointments, case details, and update investigation status.

- 📈 **Track Case Progress**
  Users can check the current status of their reports (e.g., missing, found) directly from the DApp.

- 💬 **On-chain Comments or Tips (Upcoming)**  
  Allows public tips or verified users to submit leads for open cases.


## 🛠️ Tech Stack

- **Smart Contracts** – Solidity (Ethereum)
- **Frontend** – React.js, Web3.js
- **Blockchain Framework** – Truffle
- **Deployment** – Docker

## 🛠️ Installation Guide

This project can be installed both locally and in a docker container. Make sure to install the prerequisites before proceeding.

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above recommended)
- [Ganache](https://trufflesuite.com/ganache/) (for local blockchain)
- [Truffle](https://trufflesuite.com/truffle/) CLI
- [MetaMask](https://metamask.io/) browser extension
- (Optional) [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)


### 🚀 Local Setup

 1. **Clone the Repository**

    ```bash
    $ git clone git@github.com:al-rafi304/missing-link.git
    $ cd missing-link
    ```

 2. **Install Dependencies**

    ```bash
    # In the root/truffle directory
    $ cd truffle
    $ npm install

    # In the root/client directory
    $ cd ../client
    $ npm install
    ```

 3. **Start Ganache Locally**
    - Run Ganache desktop or start it via CLI and make sure it's on port `8545`.
    - To get a test account, import a private key from Ganache to MetaMask 


 4. **Migrate Contracts**

    ```bash
    $ cd truffle
    $ truffle migrate --reset --network development
    ```

 5. **Start the Frontend**

    ```bash
    $ cd client
    $ npm start
    ```

The app will open at `http://localhost:8080`.


## 🐳 Docker Setup (Optional)

From the root of the project:

```bash
$ docker-compose up --build -d
```

This will spin up:
- A local blockchain network (if configured)
- The Truffle container to compile/migrate contracts
- The React frontend on `http://localhost:8080`
