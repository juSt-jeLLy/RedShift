// This file is used for declaring module types

declare module 'ethers' {
  export class BrowserProvider {
    constructor(provider: any);
    getSigner(): Promise<JsonRpcSigner>;
    getNetwork(): Promise<Network>;
  }

  export class JsonRpcSigner {
    getAddress(): Promise<string>;
    signMessage(message: string): Promise<string>;
  }

  export class Contract {
    constructor(address: string, abi: any, providerOrSigner: BrowserProvider | JsonRpcSigner);
    connect(signer: JsonRpcSigner): Contract;
    
    // Add any other Contract methods you need
    getFunction(name: string): Function;
    wait(): Promise<any>;
  }

  export interface Network {
    chainId: bigint;
    name: string;
  }
} 