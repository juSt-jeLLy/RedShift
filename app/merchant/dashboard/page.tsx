'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for merchant dashboard
const MOCK_MERCHANT = {
  name: 'Acme Corporation',
  did: 'did:pkh:rsk:testnet:0x1234567890abcdef1234567890abcdef12345678',
  reputationLevel: 'Gold',
  reputationScore: 85,
  totalInvoicesIssued: 37,
  totalInvoicesFinanced: 28,
  activeInvoices: 4,
  invoicesInDefault: 1,
};

const MOCK_INVOICES = [
  {
    id: 101,
    amount: 5000,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    debtor: 'Client A',
    status: 'Listed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 102,
    amount: 7500,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    debtor: 'Client B',
    status: 'Funded',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 103,
    amount: 3000,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    debtor: 'Client C',
    status: 'Repaid',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: 104,
    amount: 10000,
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    debtor: 'Client D',
    status: 'Defaulted',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
];

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploading, setIsUploading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Listed':
        return 'bg-blue-100 text-blue-800';
      case 'Funded':
        return 'bg-green-100 text-green-800';
      case 'Repaid':
        return 'bg-purple-100 text-purple-800';
      case 'Defaulted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUploadClick = () => {
    // Simulate upload process
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert('Invoice uploaded and tokenized successfully!');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center ${
            isUploading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              Upload New Invoice
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'invoices'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-4 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'reputation'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reputation')}
            >
              Reputation
            </button>
          </li>
        </ul>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Merchant Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Merchant Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium">{MOCK_MERCHANT.name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">DID</p>
                <p className="font-medium truncate">{MOCK_MERCHANT.did}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Reputation Level</p>
                <p className="font-medium">{MOCK_MERCHANT.reputationLevel}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Reputation Score</p>
                <p className="font-medium">{MOCK_MERCHANT.reputationScore} / 100</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Invoices Issued</p>
              <p className="text-2xl font-bold">{MOCK_MERCHANT.totalInvoicesIssued}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Invoices Financed</p>
              <p className="text-2xl font-bold">{MOCK_MERCHANT.totalInvoicesFinanced}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Invoices</p>
              <p className="text-2xl font-bold">{MOCK_MERCHANT.activeInvoices}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Invoices in Default</p>
              <p className="text-2xl font-bold text-red-600">{MOCK_MERCHANT.invoicesInDefault}</p>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Invoices</h2>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Debtor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {MOCK_INVOICES.slice(0, 3).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/merchant/invoice/${invoice.id}`} className="text-blue-600 hover:text-blue-800">
                          #{invoice.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.dueDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{invoice.debtor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Invoices</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Debtor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {MOCK_INVOICES.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/merchant/invoice/${invoice.id}`} className="text-blue-600 hover:text-blue-800">
                        #{invoice.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.dueDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.debtor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/merchant/invoice/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                      >
                        View
                      </Link>
                      {invoice.status === 'Created' && (
                        <a
                          href="#"
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          List
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reputation Tab */}
      {activeTab === 'reputation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Reputation Overview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Current Level</p>
                <div className="flex items-center">
                  <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full mr-2">
                    {MOCK_MERCHANT.reputationLevel}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Reputation Score</p>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {MOCK_MERCHANT.reputationScore}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${MOCK_MERCHANT.reputationScore}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Next Level</p>
                <p className="font-medium">5 more repayments to reach Platinum</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Default Risk</p>
                <p className="font-medium text-green-600">Low</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Reputation Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Repayment History</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Repayments Completed</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">On-time Payments</span>
                    <span className="font-medium">26</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Late Payments</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Defaults</span>
                    <span className="font-medium">1</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Level Requirements</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Bronze</span>
                      <span className="text-xs text-gray-500">0 repayments</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-700 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Silver</span>
                      <span className="text-xs text-gray-500">5 repayments</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Gold</span>
                      <span className="text-xs text-gray-500">15 repayments</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Platinum</span>
                      <span className="text-xs text-gray-500">30 repayments</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-300 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 