import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                RWA Microfinancing via Tokenized Invoices
              </h1>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                Privacy-preserving, reputation-aware, undercollateralized lending
                via tokenized invoices on the Rootstock blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/marketplace"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center"
                >
                  Browse Marketplace
                </Link>
                <Link
                  href="/merchant/dashboard"
                  className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 rounded-lg border border-blue-600 text-center"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/images/hero-image.svg"
                alt="RWA Microfinancing"
                width={600}
                height={400}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy Preserving</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Zero-knowledge proofs ensure sensitive invoice data stays
                  private while still verifying authenticity.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Reputation Aware</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Soulbound reputation NFTs track merchant repayment history,
                  reducing risk for investors.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Undercollateralized</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access to capital without the need for significant collateral,
                  based on invoice value and reputation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Invoice</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Merchants upload invoices which are verified and tokenized as NFTs.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">List on Marketplace</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Invoices are listed on the marketplace with ZK-verified attributes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Investor Purchase</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Investors buy invoice NFTs providing immediate capital to merchants.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Debtor Repayment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Debtors repay invoices, funds go to NFT holders, and merchant reputation updates.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">RWA Microfinancing</h3>
              <p className="text-gray-400">Built on Rootstock blockchain</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400">Terms</a>
              <a href="#" className="hover:text-blue-400">Privacy</a>
              <a href="#" className="hover:text-blue-400">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} RWA Microfinancing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
