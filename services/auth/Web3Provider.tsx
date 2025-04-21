'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner, Network } from 'ethers';

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

type Web3ContextType = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  network: Network | null;
  isConnected: boolean;
  isRSKNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
};

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  network: null,
  isConnected: false,
  isRSKNetwork: false,
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

type Web3ProviderProps = {
  children: ReactNode;
};

export function Web3Provider({ children }: Web3ProviderProps) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRSKNetwork, setIsRSKNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expected network IDs for RSK
  const RSK_NETWORK_IDS = {
    mainnet: BigInt(30),
    testnet: BigInt(31),
  };

  // Check if window.ethereum is available on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);
      } catch (error) {
        console.error('Error initializing provider:', error);
      }
    }
  }, []);

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User has disconnected
          disconnectWallet();
        } else if (accounts[0] !== address) {
          // User has switched accounts
          if (provider) {
            try {
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              
              setAddress(address);
              setSigner(signer);
            } catch (error) {
              console.error('Error getting signer:', error);
            }
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address, provider]);

  // Handle chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('Metamask not detected! Please install Metamask extension.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3Provider = new BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const currentAddress = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(currentAddress);
      setNetwork(network);
      setIsConnected(true);
      
      // Check if we're on an RSK network
      setIsRSKNetwork(
        network.chainId === RSK_NETWORK_IDS.mainnet || 
        network.chainId === RSK_NETWORK_IDS.testnet
      );

      // If not on RSK network, suggest adding or switching to it
      if (!isRSKNetwork) {
        await switchToRSKNetwork();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  const switchToRSKNetwork = async () => {
    try {
      // Try to switch to RSK Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1F' }], // 31 in hexadecimal
      });
    } catch (switchError: any) {
      // This error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x1F', // 31 in hexadecimal
                chainName: 'RSK Testnet',
                nativeCurrency: {
                  name: 'RSK Testnet RBTC',
                  symbol: 'tRBTC',
                  decimals: 18,
                },
                rpcUrls: ['https://public-node.testnet.rsk.co'],
                blockExplorerUrls: ['https://explorer.testnet.rsk.co'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add RSK network:', addError);
        }
      } else {
        console.error('Failed to switch to RSK network:', switchError);
      }
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setNetwork(null);
    setIsConnected(false);
    setIsRSKNetwork(false);
    setError(null);
  };

  const value = {
    provider,
    signer,
    address,
    network,
    isConnected,
    isRSKNetwork,
    connect: connectWallet,
    disconnect: disconnectWallet,
    error,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
} 