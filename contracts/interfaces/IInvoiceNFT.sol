// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IInvoiceNFT
 * @dev Interface for the Invoice NFT
 */
interface IInvoiceNFT {
    // Enum for invoice status
    enum InvoiceStatus { Created, Listed, Funded, Repaid, Defaulted }
    
    // Struct for invoice metadata
    struct InvoiceMetadata {
        string merchantDID;
        string debtorDID;
        uint256 amount;
        uint256 dueDate;
        string storageCID;
        bytes32 zkProofHash;
        uint256 riskScore;
        InvoiceStatus status;
    }
    
    // Events
    event InvoiceNFTMinted(address indexed merchant, uint256 tokenId, string storageCID, bytes32 zkProofHash);
    event InvoiceStatusUpdated(uint256 indexed tokenId, InvoiceStatus status);
    
    // Functions
    function mintInvoiceNFT(
        address merchant,
        string calldata merchantDID,
        string calldata debtorDID,
        uint256 amount,
        uint256 dueDate,
        string calldata storageCID,
        bytes32 zkProofHash,
        uint256 riskScore
    ) external returns (uint256);
    
    function updateInvoiceStatus(uint256 tokenId, InvoiceStatus status) external;
    function getInvoiceMetadata(uint256 tokenId) external view returns (InvoiceMetadata memory);
    function validateZKProof(uint256 tokenId, bytes calldata proof) external view returns (bool);
    function getInvoicesByMerchant(address merchant) external view returns (uint256[] memory);
    function getInvoicesByStatus(InvoiceStatus status) external view returns (uint256[] memory);
} 