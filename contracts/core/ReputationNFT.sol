// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IReputationNFT.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ReputationNFT
 * @dev Implementation of the Reputation NFT (Soulbound Token)
 * This NFT cannot be transferred once minted (soulbound to the merchant)
 */
contract ReputationNFT is IReputationNFT, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    
    // Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    // Mappings
    mapping(address => uint256) private _merchantToTokenId;
    mapping(uint256 => ReputationStats) private _tokenStats;
    
    // Thresholds for reputation level upgrades
    uint256 public silverThreshold = 5;  // 5 successful repayments
    uint256 public goldThreshold = 15;   // 15 successful repayments
    uint256 public platinumThreshold = 30; // 30 successful repayments
    
    // Struct to store reputation statistics
    struct ReputationStats {
        uint256 repaymentsCompleted;
        uint256 defaultCount;
        uint256 latePaymentCount;
        ReputationLevel level;
    }
    
    constructor() ERC721("Merchant Reputation", "MREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new Reputation NFT for a merchant
     * @param merchant The merchant address
     * @return The token ID
     */
    function mintReputationNFT(address merchant) external override onlyRole(MINTER_ROLE) returns (uint256) {
        require(merchant != address(0), "Invalid merchant address");
        require(_merchantToTokenId[merchant] == 0, "Merchant already has a reputation NFT");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(merchant, tokenId);
        _merchantToTokenId[merchant] = tokenId;
        
        // Initialize with Bronze level
        _tokenStats[tokenId] = ReputationStats({
            repaymentsCompleted: 0,
            defaultCount: 0,
            latePaymentCount: 0,
            level: ReputationLevel.Bronze
        });
        
        emit ReputationNFTMinted(merchant, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Update reputation statistics for a merchant
     * @param merchant The merchant address
     * @param onTime Whether the repayment was on time
     */
    function updateStats(address merchant, bool onTime) external override onlyRole(UPDATER_ROLE) {
        uint256 tokenId = _merchantToTokenId[merchant];
        require(tokenId != 0, "Merchant has no reputation NFT");
        
        ReputationStats storage stats = _tokenStats[tokenId];
        
        stats.repaymentsCompleted++;
        
        if (!onTime) {
            stats.latePaymentCount++;
        }
        
        // Check for level upgrades
        if (stats.level == ReputationLevel.Bronze && stats.repaymentsCompleted >= silverThreshold) {
            stats.level = ReputationLevel.Silver;
            emit ReputationLevelUpdated(merchant, tokenId, ReputationLevel.Silver);
        } else if (stats.level == ReputationLevel.Silver && stats.repaymentsCompleted >= goldThreshold) {
            stats.level = ReputationLevel.Gold;
            emit ReputationLevelUpdated(merchant, tokenId, ReputationLevel.Gold);
        } else if (stats.level == ReputationLevel.Gold && stats.repaymentsCompleted >= platinumThreshold) {
            stats.level = ReputationLevel.Platinum;
            emit ReputationLevelUpdated(merchant, tokenId, ReputationLevel.Platinum);
        }
        
        emit ReputationUpdated(merchant, tokenId, onTime, stats.repaymentsCompleted);
    }
    
    /**
     * @dev Record a default for a merchant
     * @param merchant The merchant address
     */
    function recordDefault(address merchant) external onlyRole(UPDATER_ROLE) {
        uint256 tokenId = _merchantToTokenId[merchant];
        require(tokenId != 0, "Merchant has no reputation NFT");
        
        _tokenStats[tokenId].defaultCount++;
        
        // Downgrade reputation level on default
        if (_tokenStats[tokenId].level != ReputationLevel.Bronze) {
            ReputationLevel previousLevel = _tokenStats[tokenId].level;
            _tokenStats[tokenId].level = ReputationLevel(uint8(previousLevel) - 1);
            
            emit ReputationLevelUpdated(merchant, tokenId, _tokenStats[tokenId].level);
        }
    }
    
    /**
     * @dev Get the reputation score for a merchant
     * Based on repayments completed with penalties for defaults and late payments
     * @param merchant The merchant address
     * @return The reputation score
     */
    function getScore(address merchant) external view override returns (uint256) {
        uint256 tokenId = _merchantToTokenId[merchant];
        if (tokenId == 0) return 0;
        
        ReputationStats memory stats = _tokenStats[tokenId];
        
        // Score = repayments - (3 * defaults) - (0.5 * latePayments)
        int256 score = int256(stats.repaymentsCompleted) - 
                      (int256(stats.defaultCount) * 3) - 
                      (int256(stats.latePaymentCount) / 2);
        
        return score > 0 ? uint256(score) : 0;
    }
    
    /**
     * @dev Get the number of repayments completed by a merchant
     * @param merchant The merchant address
     * @return The number of repayments
     */
    function getRepaymentsCompleted(address merchant) external view override returns (uint256) {
        uint256 tokenId = _merchantToTokenId[merchant];
        if (tokenId == 0) return 0;
        
        return _tokenStats[tokenId].repaymentsCompleted;
    }
    
    /**
     * @dev Get the number of defaults by a merchant
     * @param merchant The merchant address
     * @return The number of defaults
     */
    function getDefaultCount(address merchant) external view override returns (uint256) {
        uint256 tokenId = _merchantToTokenId[merchant];
        if (tokenId == 0) return 0;
        
        return _tokenStats[tokenId].defaultCount;
    }
    
    /**
     * @dev Get the number of late payments by a merchant
     * @param merchant The merchant address
     * @return The number of late payments
     */
    function getLatePaymentCount(address merchant) external view override returns (uint256) {
        uint256 tokenId = _merchantToTokenId[merchant];
        if (tokenId == 0) return 0;
        
        return _tokenStats[tokenId].latePaymentCount;
    }
    
    /**
     * @dev Get the reputation level of a merchant
     * @param merchant The merchant address
     * @return The reputation level
     */
    function getLevel(address merchant) external view override returns (ReputationLevel) {
        uint256 tokenId = _merchantToTokenId[merchant];
        if (tokenId == 0) return ReputationLevel.Bronze;
        
        return _tokenStats[tokenId].level;
    }
    
    /**
     * @dev Check if an address holds a reputation NFT
     * @param merchant The address to check
     * @return True if the address holds a reputation NFT
     */
    function isReputationHolder(address merchant) external view override returns (bool) {
        return _merchantToTokenId[merchant] != 0;
    }
    
    /**
     * @dev Get the token ID for a merchant
     * @param merchant The merchant address
     * @return The token ID
     */
    function getTokenId(address merchant) external view override returns (uint256) {
        return _merchantToTokenId[merchant];
    }
    
    /**
     * @dev Set the thresholds for reputation level upgrades
     * @param _silverThreshold The threshold for Silver level
     * @param _goldThreshold The threshold for Gold level
     * @param _platinumThreshold The threshold for Platinum level
     */
    function setThresholds(
        uint256 _silverThreshold,
        uint256 _goldThreshold,
        uint256 _platinumThreshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_silverThreshold < _goldThreshold, "Silver must be less than Gold");
        require(_goldThreshold < _platinumThreshold, "Gold must be less than Platinum");
        
        silverThreshold = _silverThreshold;
        goldThreshold = _goldThreshold;
        platinumThreshold = _platinumThreshold;
    }
    
    /**
     * @dev Override ERC721 transfer functions to make tokens soulbound
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Enumerable) {
        // Only allow minting, not transfers (soulbound)
        require(from == address(0) || to == address(0), "Reputation tokens are soulbound");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    // Required overrides from ERC721 and AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 