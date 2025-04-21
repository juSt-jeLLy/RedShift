import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import InvoiceNFTAbi from './abis/InvoiceNFT.json';
import DIDRegistryAbi from './abis/DIDRegistry.json';
import RepaymentManagerAbi from './abis/RepaymentManager.json';

// Contract addresses - these would typically come from a deployment config
const CONTRACT_ADDRESSES = {
  // Replace with actual contract addresses after deployment
  InvoiceNFT: '0x0000000000000000000000000000000000000000',
  DIDRegistry: '0x0000000000000000000000000000000000000000',
  RepaymentManager: '0x0000000000000000000000000000000000000000',
};

export class ContractService {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  invoiceNFT: Contract | null = null;
  didRegistry: Contract | null = null;
  repaymentManager: Contract | null = null;

  constructor(provider: BrowserProvider | null, signer: JsonRpcSigner | null) {
    this.provider = provider;
    this.signer = signer;
    this.initContracts();
  }

  async initContracts() {
    if (!this.provider) return;

    try {
      // Initialize contracts with provider (read-only)
      this.invoiceNFT = new Contract(
        CONTRACT_ADDRESSES.InvoiceNFT,
        InvoiceNFTAbi,
        this.provider
      );

      this.didRegistry = new Contract(
        CONTRACT_ADDRESSES.DIDRegistry,
        DIDRegistryAbi,
        this.provider
      );

      this.repaymentManager = new Contract(
        CONTRACT_ADDRESSES.RepaymentManager,
        RepaymentManagerAbi,
        this.provider
      );

      // If signer is available, connect contracts for write operations
      if (this.signer) {
        this.invoiceNFT = this.invoiceNFT.connect(this.signer);
        this.didRegistry = this.didRegistry.connect(this.signer);
        this.repaymentManager = this.repaymentManager.connect(this.signer);
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }

  // Example methods to interact with contracts
  
  // InvoiceNFT methods
  async getInvoiceDetails(tokenId: number) {
    if (!this.invoiceNFT) throw new Error('InvoiceNFT contract not initialized');
    return await this.invoiceNFT.getFunction('getInvoiceDetails')(tokenId);
  }

  async createInvoice(buyer: string, amount: bigint, dueDate: bigint, metadataURI: string) {
    if (!this.invoiceNFT || !this.signer) 
      throw new Error('InvoiceNFT contract not initialized or signer not available');
    
    const tx = await this.invoiceNFT.getFunction('createInvoice')(buyer, amount, dueDate, metadataURI);
    return await tx.wait();
  }

  // DIDRegistry methods
  async isDIDRegistered(did: string) {
    if (!this.didRegistry) throw new Error('DIDRegistry contract not initialized');
    return await this.didRegistry.getFunction('isDIDRegistered')(did);
  }

  // RepaymentManager methods
  async getRepaymentStatus(tokenId: number) {
    if (!this.repaymentManager) throw new Error('RepaymentManager contract not initialized');
    return await this.repaymentManager.getFunction('getInvoiceRepaymentStatus')(tokenId);
  }
} 