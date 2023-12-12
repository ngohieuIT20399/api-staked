import 'dotenv/config';
import { abi } from '../contracts/WalletStorage.json';
import { ethers } from 'ethers';
const DEPLOYED_CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const netWork = process.env.NETWORK;
const provider = new ethers.JsonRpcProvider(netWork);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
export const contractsInstance = new ethers.Contract(
  DEPLOYED_CONTRACT_ADDRESS,
  abi,
  signer,
);
