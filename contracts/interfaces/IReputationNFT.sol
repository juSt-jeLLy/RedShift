// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReputationNFT
 * @dev Interface for the Reputation NFT (Soulbound Token)
 */
interface IReputationNFT {
    // Enum for reputation levels
    enum ReputationLevel { Bronze, Silver, Gold, Platinum }
    
    // Events
    event ReputationNFTMinted(address indexed merchant, uint256 tokenId);
    event ReputationUpdated(address indexed merchant, uint256 tokenId, bool onTime, uint256 repaymentsCompleted);
    event ReputationLevelUpdated(address indexed merchant, uint256 tokenId, ReputationLevel level);
    
    // Functions
    function mintReputationNFT(address merchant) external returns (uint256);
    function updateStats(address merchant, bool onTime) external;
    function getScore(address merchant) external view returns (uint256);
    function getRepaymentsCompleted(address merchant) external view returns (uint256);
    function getDefaultCount(address merchant) external view returns (uint256);
    function getLatePaymentCount(address merchant) external view returns (uint256);
    function getLevel(address merchant) external view returns (ReputationLevel);
    function isReputationHolder(address merchant) external view returns (bool);
    function getTokenId(address merchant) external view returns (uint256);
} 