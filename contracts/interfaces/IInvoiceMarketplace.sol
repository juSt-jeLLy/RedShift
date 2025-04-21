// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IInvoiceNFT.sol";

/**
 * @title IInvoiceMarketplace
 * @dev Interface for the Invoice Marketplace
 */
interface IInvoiceMarketplace {
    // Struct for listing details
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 discountRate;
        uint256 listedTimestamp;
        bool active;
    }
    
    // Events
    event InvoiceListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 discountRate);
    event InvoiceUnlisted(uint256 indexed tokenId, address indexed seller);
    event InvoiceSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event FeeUpdated(uint256 newFeePercentage);
    
    // Functions
    function listInvoice(uint256 tokenId, uint256 price, uint256 discountRate) external;
    function unlistInvoice(uint256 tokenId) external;
    function buyInvoice(uint256 tokenId) external payable;
    function getFilteredInvoices(
        uint256 minPrice, 
        uint256 maxPrice, 
        uint256 minReputationScore, 
        uint256 maxRiskScore
    ) external view returns (uint256[] memory);
    function getListing(uint256 tokenId) external view returns (Listing memory);
    function getListingCount() external view returns (uint256);
    function getAllListings() external view returns (Listing[] memory);
    function getPlatformFee() external view returns (uint256);
    function setFeePercentage(uint256 newFeePercentage) external;
    function withdrawFees() external;
} 