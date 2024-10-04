# Zutalent

Zutalent is an innovative platform designed to empower users by allowing them to securely and privately manage their builder scores from Talent Protocol. As a solo developer, I am leveraging cutting-edge zero-knowledge (zk) technology through Zupass to ensure that users can attest to their builder scores without compromising their personal identity.

## Key Features

### Privacy-Preserving Attestations
- Users can connect their wallets to Zupass, which generates a Provable Object Data (POD).
- This POD attests to their Talent Protocol builder score, ensuring that only the rank score is revealed, while personal information remains confidential.

### On-Chain Score Management
- Builder scores are securely stored on the Base Sepolia blockchain.
- This ensures transparency and immutability, allowing users to manage their scores with confidence.

### Interoperability and Flexibility
- By integrating with Zupass and Talent Protocol, Zutalent offers seamless interoperability.
- Users can easily manage their scores across platforms without the need for multiple accounts or disclosures.

### Optional Identity Revelation
- While the default setup maintains user anonymity, Zutalent provides the option for users to reveal their identity through Zupass if they choose.
- This flexibility caters to various user needs and preferences.

### Zero-Knowledge Technology
- The use of zk technology ensures that users can prove their builder scores without revealing any additional information.
- This enhances security and privacy, making Zutalent a trustworthy platform for managing digital credentials.

## Conclusion
Zutalent is a forward-thinking solution that addresses the growing need for privacy and security in digital credential management. By combining the power of Zupass and Talent Protocol, it offers a robust platform for users to manage their builder scores with confidence and flexibility. As the sole developer, I am committed to refining and expanding this project during the hackathon to meet the evolving needs of our users.

## Getting Started

To get started with Zutalent, follow these steps:

1. **Clone the repository:**
   ```bash
   https://github.com/MarazzaM/ZuTalent-front
   cd zutalent
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Technologies Used

- **Next.js**: A React framework for building fast and user-friendly web applications.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Zupass**: A zero-knowledge technology platform for secure and private data management.
- **Ethereum Attestation Service (EAS)**: A decentralized protocol for creating, verifying, and revoking on-chain attestations.
- **Base Sepolia**: A testnet for the Base blockchain, providing a secure and efficient environment for storing and managing builder scores.
- **Talent Protocol**: A Web3 professional network that allows users to invest in promising talent and earn rewards as they grow.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Special thanks to the Talent Protocol and Zupass teams for their support and collaboration.
