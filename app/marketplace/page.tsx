'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for invoices
const MOCK_INVOICES = [
  {
    id: 1,
    amount: 5000,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    merchantName: 'Acme Corporation',
    merchantLevel: 'Gold',
    discountRate: 5,
    riskScore: 2,
  },
  {
    id: 2,
    amount: 7500,
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    merchantName: 'Tech Innovations',
    merchantLevel: 'Silver',
    discountRate: 7,
    riskScore: 3,
  },
  {
    id: 3,
    amount: 12000,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    merchantName: 'Global Services',
    merchantLevel: 'Platinum',
    discountRate: 3,
    riskScore: 1,
  },
  {
    id: 4,
    amount: 3500,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    merchantName: 'Local Shop',
    merchantLevel: 'Bronze',
    discountRate: 8,
    riskScore: 4,
  },
];

export default function Marketplace() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    minReputation: 'Bronze',
    maxRiskScore: '5',
  });

  // Get badge color based on merchant level
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Bronze':
        return 'bg-amber-700';
      case 'Silver':
        return 'bg-gray-400';
      case 'Gold':
        return 'bg-yellow-500';
      case 'Platinum':
        return 'bg-blue-300';
      default:
        return 'bg-gray-200';
    }
  };

  // Get color based on risk score
  const getRiskColor = (score: number) => {
    switch (score) {
      case 1:
        return 'text-green-600';
      case 2:
        return 'text-green-500';
      case 3:
        return 'text-yellow-500';
      case 4:
        return 'text-orange-500';
      case 5:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // In a real app, this would be an API call with filter parameters
    const filtered = MOCK_INVOICES.filter((invoice) => {
      // Filter by amount
      if (
        filters.minAmount &&
        parseInt(filters.minAmount) > invoice.amount
      ) {
        return false;
      }
      if (
        filters.maxAmount &&
        parseInt(filters.maxAmount) < invoice.amount
      ) {
        return false;
      }

      // Filter by reputation (simplified for demo)
      const reputationRank = {
        Bronze: 1,
        Silver: 2,
        Gold: 3,
        Platinum: 4,
      };
      if (
        reputationRank[filters.minReputation as keyof typeof reputationRank] >
        reputationRank[invoice.merchantLevel as keyof typeof reputationRank]
      ) {
        return false;
      }

      // Filter by risk score
      if (
        parseInt(filters.maxRiskScore) < invoice.riskScore
      ) {
        return false;
      }

      return true;
    });

    setInvoices(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      minReputation: 'Bronze',
      maxRiskScore: '5',
    });
    setInvoices(MOCK_INVOICES);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Invoice Marketplace</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="Minimum amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="Maximum amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Reputation
            </label>
            <select
              name="minReputation"
              value={filters.minReputation}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Risk Score
            </label>
            <select
              name="maxRiskScore"
              value={filters.maxRiskScore}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="5">Any</option>
              <option value="4">4 or lower</option>
              <option value="3">3 or lower</option>
              <option value="2">2 or lower</option>
              <option value="1">1 (Lowest risk)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">${invoice.amount.toLocaleString()}</h3>
                  <span
                    className={`${getLevelBadgeColor(
                      invoice.merchantLevel
                    )} text-white text-xs font-bold px-2 py-1 rounded-full`}
                  >
                    {invoice.merchantLevel}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium">
                      {invoice.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Merchant:</span>
                    <span className="font-medium">{invoice.merchantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount Rate:</span>
                    <span className="font-medium">{invoice.discountRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Risk Score:</span>
                    <span className={`font-medium ${getRiskColor(invoice.riskScore)}`}>
                      {invoice.riskScore} / 5
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-medium">ZK Verified</span> ✓
                  </div>
                  <Link
                    href={`/marketplace/invoice/${invoice.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No invoices found matching your filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 