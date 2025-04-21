// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IInvoiceNFT.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title InvoiceNFT
 * @dev Implementation of the Invoice NFT
 */
contract InvoiceNFT is IInvoiceNFT, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    
    // Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    // Mappings
    mapping(uint256 => InvoiceMetadata) private _invoiceMetadata;
    mapping(address => uint256[]) private _merchantInvoices;
    mapping(InvoiceStatus => uint256[]) private _invoicesByStatus;
    
    constructor() ERC721("Invoice Token", "INVC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new Invoice NFT
     * @param merchant The merchant address
     * @param merchantDID The merchant's DID
     * @param debtorDID The debtor's DID
     * @param amount The invoice amount
     * @param dueDate The due date timestamp
     * @param storageCID The IPFS CID for the invoice document
     * @param zkProofHash The hash of the ZK proof
     * @param riskScore The AI-generated risk score
     * @return The token ID
     */
    function mintInvoiceNFT(
        address merchant,
        string calldata merchantDID,
        string calldata debtorDID,
        uint256 amount,
        uint256 dueDate,
        string calldata storageCID,
        bytes32 zkProofHash,
        uint256 riskScore
    ) external override onlyRole(MINTER_ROLE) returns (uint256) {
        require(merchant != address(0), "Invalid merchant address");
        require(bytes(merchantDID).length > 0, "Merchant DID cannot be empty");
        require(bytes(debtorDID).length > 0, "Debtor DID cannot be empty");
        require(amount > 0, "Amount must be greater than zero");
        require(dueDate > block.timestamp, "Due date must be in the future");
        require(bytes(storageCID).length > 0, "Storage CID cannot be empty");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(merchant, tokenId);
        
        // Store metadata
        _invoiceMetadata[tokenId] = InvoiceMetadata({
            merchantDID: merchantDID,
            debtorDID: debtorDID,
            amount: amount,
            dueDate: dueDate,
            storageCID: storageCID,
            zkProofHash: zkProofHash,
            riskScore: riskScore,
            status: InvoiceStatus.Created
        });
        
        // Update mappings
        _merchantInvoices[merchant].push(tokenId);
        _invoicesByStatus[InvoiceStatus.Created].push(tokenId);
        
        emit InvoiceNFTMinted(merchant, tokenId, storageCID, zkProofHash);
        
        return tokenId;
    }
    
    /**
     * @dev Update the status of an invoice
     * @param tokenId The token ID
     * @param status The new status
     */
    function updateInvoiceStatus(uint256 tokenId, InvoiceStatus status) external override onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        
        // Remove from old status array
        InvoiceStatus oldStatus = _invoiceMetadata[tokenId].status;
        _removeFromStatusArray(tokenId, oldStatus);
        
        // Update status and add to new status array
        _invoiceMetadata[tokenId].status = status;
        _invoicesByStatus[status].push(tokenId);
        
        emit InvoiceStatusUpdated(tokenId, status);
    }
    
    /**
     * @dev Remove a token from its status array
     * @param tokenId The token ID
     * @param status The status to remove from
     */
    function _removeFromStatusArray(uint256 tokenId, InvoiceStatus status) private {
        uint256[] storage statusArray = _invoicesByStatus[status];
        
        for (uint256 i = 0; i < statusArray.length; i++) {
            if (statusArray[i] == tokenId) {
                // Replace with the last element and pop
                statusArray[i] = statusArray[statusArray.length - 1];
                statusArray.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get the metadata for an invoice
     * @param tokenId The token ID
     * @return The invoice metadata
     */
    function getInvoiceMetadata(uint256 tokenId) external view override returns (InvoiceMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return _invoiceMetadata[tokenId];
    }
    
    /**
     * @dev Validate a ZK proof for an invoice
     * @param tokenId The token ID
     * @param proof The ZK proof
     * @return True if the proof is valid
     */
    function validateZKProof(uint256 tokenId, bytes calldata proof) external view override returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        
        // For testing purposes, just verify the hash matches
        // In production, this would use a ZK verification library
        bytes32 proofHash = keccak256(proof);
        return proofHash == _invoiceMetadata[tokenId].zkProofHash;
    }
    
    /**
     * @dev Get all invoices for a merchant
     * @param merchant The merchant address
     * @return Array of token IDs
     */
    function getInvoicesByMerchant(address merchant) external view override returns (uint256[] memory) {
        return _merchantInvoices[merchant];
    }
    
    /**
     * @dev Get all invoices with a certain status
     * @param status The status to filter by
     * @return Array of token IDs
     */
    function getInvoicesByStatus(InvoiceStatus status) external view override returns (uint256[] memory) {
        return _invoicesByStatus[status];
    }
    
    /**
     * @dev Check if a token ID exists
     * @param tokenId The token ID to check
     * @return True if the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIdCounter.current() && ownerOf(tokenId) != address(0);
    }
    
    // Required overrides from ERC721 and AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 