// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IInvoiceMarketplace.sol";
import "../interfaces/IInvoiceNFT.sol";
import "../interfaces/IReputationNFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title InvoiceMarketplace
 * @dev Implementation of the Invoice Marketplace
 */
contract InvoiceMarketplace is IInvoiceMarketplace, ERC721Holder, AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // State variables
    address public invoiceNFTAddress;
    address public reputationNFTAddress;
    uint256 public feePercentage = 100; // 1% in basis points (100 = 1%)
    uint256 public constant MAX_FEE = 1000; // 10% max fee
    address public feeCollector;
    
    // Mappings
    mapping(uint256 => Listing) private _listings;
    uint256[] private _listedTokenIds;
    
    constructor(address _invoiceNFTAddress, address _reputationNFTAddress) {
        require(_invoiceNFTAddress != address(0), "Invalid invoice NFT address");
        require(_reputationNFTAddress != address(0), "Invalid reputation NFT address");
        
        invoiceNFTAddress = _invoiceNFTAddress;
        reputationNFTAddress = _reputationNFTAddress;
        feeCollector = msg.sender;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev List an invoice for sale
     * @param tokenId The token ID
     * @param price The price in wei
     * @param discountRate The discount rate in basis points
     */
    function listInvoice(uint256 tokenId, uint256 price, uint256 discountRate) external override nonReentrant {
        IERC721 invoiceNFT = IERC721(invoiceNFTAddress);
        
        require(invoiceNFT.ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(price > 0, "Price must be greater than zero");
        require(discountRate <= 10000, "Discount rate must be <= 10000 (100%)");
        require(!_listings[tokenId].active, "Invoice already listed");
        
        // Transfer the NFT to the marketplace
        invoiceNFT.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Update invoice status
        IInvoiceNFT(invoiceNFTAddress).updateInvoiceStatus(tokenId, IInvoiceNFT.InvoiceStatus.Listed);
        
        // Create listing
        _listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            discountRate: discountRate,
            listedTimestamp: block.timestamp,
            active: true
        });
        
        _listedTokenIds.push(tokenId);
        
        emit InvoiceListed(tokenId, msg.sender, price, discountRate);
    }
    
    /**
     * @dev Unlist an invoice
     * @param tokenId The token ID
     */
    function unlistInvoice(uint256 tokenId) external override nonReentrant {
        Listing storage listing = _listings[tokenId];
        
        require(listing.active, "Invoice not listed");
        require(listing.seller == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        // Transfer the NFT back to the seller
        IERC721(invoiceNFTAddress).safeTransferFrom(address(this), listing.seller, tokenId);
        
        // Update invoice status
        IInvoiceNFT(invoiceNFTAddress).updateInvoiceStatus(tokenId, IInvoiceNFT.InvoiceStatus.Created);
        
        // Deactivate listing
        listing.active = false;
        
        // Remove from active listings array
        _removeFromListedTokens(tokenId);
        
        emit InvoiceUnlisted(tokenId, listing.seller);
    }
    
    /**
     * @dev Buy an invoice
     * @param tokenId The token ID
     */
    function buyInvoice(uint256 tokenId) external payable override nonReentrant {
        Listing storage listing = _listings[tokenId];
        
        require(listing.active, "Invoice not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Calculate fee
        uint256 fee = (listing.price * feePercentage) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Transfer funds
        (bool feeSuccess, ) = feeCollector.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Seller transfer failed");
        
        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund transfer failed");
        }
        
        // Transfer the NFT to the buyer
        IERC721(invoiceNFTAddress).safeTransferFrom(address(this), msg.sender, tokenId);
        
        // Update invoice status
        IInvoiceNFT(invoiceNFTAddress).updateInvoiceStatus(tokenId, IInvoiceNFT.InvoiceStatus.Funded);
        
        // Deactivate listing
        listing.active = false;
        
        // Remove from active listings array
        _removeFromListedTokens(tokenId);
        
        emit InvoiceSold(tokenId, listing.seller, msg.sender, listing.price);
    }
    
    /**
     * @dev Get filtered invoices based on criteria
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @param minReputationScore The minimum reputation score
     * @param maxRiskScore The maximum risk score
     * @return Array of token IDs
     */
    function getFilteredInvoices(
        uint256 minPrice, 
        uint256 maxPrice, 
        uint256 minReputationScore, 
        uint256 maxRiskScore
    ) external view override returns (uint256[] memory) {
        uint256 resultCount = 0;
        
        // Count matching invoices
        for (uint256 i = 0; i < _listedTokenIds.length; i++) {
            uint256 tokenId = _listedTokenIds[i];
            if (_isMatchingFilter(tokenId, minPrice, maxPrice, minReputationScore, maxRiskScore)) {
                resultCount++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](resultCount);
        uint256 currentIndex = 0;
        
        // Fill result array
        for (uint256 i = 0; i < _listedTokenIds.length && currentIndex < resultCount; i++) {
            uint256 tokenId = _listedTokenIds[i];
            if (_isMatchingFilter(tokenId, minPrice, maxPrice, minReputationScore, maxRiskScore)) {
                result[currentIndex] = tokenId;
                currentIndex++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Check if an invoice matches the filter criteria
     * @param tokenId The token ID
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @param minReputationScore The minimum reputation score
     * @param maxRiskScore The maximum risk score
     * @return True if the invoice matches
     */
    function _isMatchingFilter(
        uint256 tokenId,
        uint256 minPrice,
        uint256 maxPrice,
        uint256 minReputationScore,
        uint256 maxRiskScore
    ) private view returns (bool) {
        Listing memory listing = _listings[tokenId];
        
        // Check if the listing is active
        if (!listing.active) {
            return false;
        }
        
        // Check price range
        if (listing.price < minPrice || (maxPrice > 0 && listing.price > maxPrice)) {
            return false;
        }
        
        // Get invoice metadata
        IInvoiceNFT.InvoiceMetadata memory metadata = IInvoiceNFT(invoiceNFTAddress).getInvoiceMetadata(tokenId);
        
        // Check risk score
        if (maxRiskScore > 0 && metadata.riskScore > maxRiskScore) {
            return false;
        }
        
        // Check reputation score
        if (minReputationScore > 0) {
            uint256 reputationScore = IReputationNFT(reputationNFTAddress).getScore(listing.seller);
            if (reputationScore < minReputationScore) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Remove a token from the listed tokens array
     * @param tokenId The token ID
     */
    function _removeFromListedTokens(uint256 tokenId) private {
        for (uint256 i = 0; i < _listedTokenIds.length; i++) {
            if (_listedTokenIds[i] == tokenId) {
                // Replace with the last element and pop
                _listedTokenIds[i] = _listedTokenIds[_listedTokenIds.length - 1];
                _listedTokenIds.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get a listing by token ID
     * @param tokenId The token ID
     * @return The listing
     */
    function getListing(uint256 tokenId) external view override returns (Listing memory) {
        return _listings[tokenId];
    }
    
    /**
     * @dev Get the number of active listings
     * @return The number of active listings
     */
    function getListingCount() external view override returns (uint256) {
        return _listedTokenIds.length;
    }
    
    /**
     * @dev Get all active listings
     * @return Array of listings
     */
    function getAllListings() external view override returns (Listing[] memory) {
        Listing[] memory result = new Listing[](_listedTokenIds.length);
        
        for (uint256 i = 0; i < _listedTokenIds.length; i++) {
            result[i] = _listings[_listedTokenIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get the platform fee percentage
     * @return The fee percentage in basis points
     */
    function getPlatformFee() external view override returns (uint256) {
        return feePercentage;
    }
    
    /**
     * @dev Set the fee percentage
     * @param newFeePercentage The new fee percentage in basis points
     */
    function setFeePercentage(uint256 newFeePercentage) external override onlyRole(ADMIN_ROLE) {
        require(newFeePercentage <= MAX_FEE, "Fee exceeds maximum");
        
        feePercentage = newFeePercentage;
        
        emit FeeUpdated(newFeePercentage);
    }
    
    /**
     * @dev Set the fee collector address
     * @param newFeeCollector The new fee collector address
     */
    function setFeeCollector(address newFeeCollector) external onlyRole(ADMIN_ROLE) {
        require(newFeeCollector != address(0), "Invalid fee collector address");
        
        feeCollector = newFeeCollector;
    }
    
    /**
     * @dev Withdraw fees (should not be needed since fees are sent immediately)
     * For emergency recovery only
     */
    function withdrawFees() external override onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = feeCollector.call{value: balance}("");
        require(success, "Transfer failed");
    }
} 