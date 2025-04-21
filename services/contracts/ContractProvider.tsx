'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from '@/services/auth/Web3Provider';
import { ContractService } from './ContractService';

type ContractContextType = {
  contractService: ContractService | null;
  isInitialized: boolean;
};

const ContractContext = createContext<ContractContextType>({
  contractService: null,
  isInitialized: false,
});

export const useContracts = () => useContext(ContractContext);

type ContractProviderProps = {
  children: ReactNode;
};

export function ContractProvider({ children }: ContractProviderProps) {
  const { provider, signer, isConnected } = useWeb3();
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize contract service when provider and signer are available
  useEffect(() => {
    if (provider) {
      const service = new ContractService(provider, signer);
      setContractService(service);
      setIsInitialized(true);
    } else {
      setContractService(null);
      setIsInitialized(false);
    }
  }, [provider, signer, isConnected]);

  const value = {
    contractService,
    isInitialized,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
} 