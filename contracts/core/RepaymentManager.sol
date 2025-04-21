// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IRepaymentManager.sol";
import "../interfaces/IInvoiceNFT.sol";
import "../interfaces/IReputationNFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RepaymentManager
 * @dev Implementation of the Repayment Manager
 */
contract RepaymentManager is IRepaymentManager, AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // State variables
    address public invoiceNFTAddress;
    address public reputationNFTAddress;
    uint256 public latePaymentFee = 500; // 5% in basis points
    uint256 public defaultThresholdDays = 30; // 30 days after due date is default
    
    // Mappings
    mapping(uint256 => RepaymentInfo) private _repaymentInfo;
    
    // Struct to store repayment information
    struct RepaymentInfo {
        uint256 amountPaid;
        uint256 timestamp;
        bool isPaid;
    }
    
    constructor(address _invoiceNFTAddress, address _reputationNFTAddress) {
        require(_invoiceNFTAddress != address(0), "Invalid invoice NFT address");
        require(_reputationNFTAddress != address(0), "Invalid reputation NFT address");
        
        invoiceNFTAddress = _invoiceNFTAddress;
        reputationNFTAddress = _reputationNFTAddress;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Repay an invoice
     * @param tokenId The token ID
     */
    function repayInvoice(uint256 tokenId) external payable override nonReentrant {
        IInvoiceNFT invoiceNFT = IInvoiceNFT(invoiceNFTAddress);
        IInvoiceNFT.InvoiceMetadata memory metadata = invoiceNFT.getInvoiceMetadata(tokenId);
        
        require(metadata.status != IInvoiceNFT.InvoiceStatus.Repaid, "Invoice already repaid");
        require(metadata.status != IInvoiceNFT.InvoiceStatus.Defaulted, "Invoice already defaulted");
        
        uint256 amountDue = metadata.amount;
        
        // Add late payment fee if applicable
        if (block.timestamp > metadata.dueDate) {
            amountDue += (metadata.amount * latePaymentFee) / 10000;
        }
        
        require(msg.value >= amountDue, "Insufficient payment");
        
        // Get the current owner of the invoice NFT
        address recipient = IERC721(invoiceNFTAddress).ownerOf(tokenId);
        
        // Transfer payment to the recipient
        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Payment transfer failed");
        
        // Update repayment info
        _repaymentInfo[tokenId] = RepaymentInfo({
            amountPaid: msg.value,
            timestamp: block.timestamp,
            isPaid: true
        });
        
        // Update invoice status
        invoiceNFT.updateInvoiceStatus(tokenId, IInvoiceNFT.InvoiceStatus.Repaid);
        
        // Update merchant reputation
        _updateMerchantReputation(metadata.merchantDID, block.timestamp <= metadata.dueDate);
        
        emit RepaymentReceived(tokenId, msg.sender, msg.value, block.timestamp);
        emit RepaymentDistributed(tokenId, recipient, msg.value);
    }
    
    /**
     * @dev Update merchant reputation based on DID
     * @param merchantDID The merchant's DID
     * @param onTime Whether the repayment was on time
     */
    function _updateMerchantReputation(string memory merchantDID, bool onTime) private {
        // In a real implementation, we would look up the merchant's address from the DID
        // For this example, we'll skip this step
        // IReputationNFT(reputationNFTAddress).updateStats(merchantAddress, onTime);
    }
    
    /**
     * @dev Process defaulted invoices
     * Anyone can call this to mark overdue invoices as defaulted
     */
    function processDefaultedInvoices() external override {
        IInvoiceNFT invoiceNFT = IInvoiceNFT(invoiceNFTAddress);
        uint256[] memory fundedInvoices = invoiceNFT.getInvoicesByStatus(IInvoiceNFT.InvoiceStatus.Funded);
        
        for (uint256 i = 0; i < fundedInvoices.length; i++) {
            uint256 tokenId = fundedInvoices[i];
            IInvoiceNFT.InvoiceMetadata memory metadata = invoiceNFT.getInvoiceMetadata(tokenId);
            
            // Check if the invoice is past the default threshold
            if (block.timestamp > metadata.dueDate + (defaultThresholdDays * 1 days)) {
                // Mark as defaulted
                invoiceNFT.updateInvoiceStatus(tokenId, IInvoiceNFT.InvoiceStatus.Defaulted);
                
                // Record default for merchant reputation
                address merchantAddress = _getMerchantAddressFromDID(metadata.merchantDID);
                if (merchantAddress != address(0)) {
                    IReputationNFT(reputationNFTAddress).recordDefault(merchantAddress);
                }
            }
        }
    }
    
    /**
     * @dev Get merchant address from DID (mock implementation)
     * @param merchantDID The merchant's DID
     * @return The merchant's address
     */
    function _getMerchantAddressFromDID(string memory merchantDID) private pure returns (address) {
        // This is a mock implementation
        // In a real application, we would query the DID Registry
        return address(0);
    }
    
    /**
     * @dev Get repayment status for an invoice
     * @param tokenId The token ID
     * @return isPaid Whether the invoice is paid
     * @return amountPaid The amount paid
     * @return amountDue The amount due
     * @return dueDate The due date
     * @return isLate Whether the payment is late
     * @return isDefaulted Whether the invoice is defaulted
     */
    function getRepaymentStatus(uint256 tokenId) external view override returns (
        bool isPaid,
        uint256 amountPaid,
        uint256 amountDue,
        uint256 dueDate,
        bool isLate,
        bool isDefaulted
    ) {
        IInvoiceNFT invoiceNFT = IInvoiceNFT(invoiceNFTAddress);
        IInvoiceNFT.InvoiceMetadata memory metadata = invoiceNFT.getInvoiceMetadata(tokenId);
        RepaymentInfo memory repaymentInfo = _repaymentInfo[tokenId];
        
        isPaid = repaymentInfo.isPaid;
        amountPaid = repaymentInfo.amountPaid;
        dueDate = metadata.dueDate;
        
        uint256 calculatedAmountDue = metadata.amount;
        if (block.timestamp > metadata.dueDate) {
            calculatedAmountDue += (metadata.amount * latePaymentFee) / 10000;
        }
        
        amountDue = calculatedAmountDue;
        isLate = block.timestamp > metadata.dueDate && !isPaid;
        isDefaulted = metadata.status == IInvoiceNFT.InvoiceStatus.Defaulted;
    }
    
    /**
     * @dev Set the late payment fee
     * @param newLatePaymentFee The new late payment fee in basis points
     */
    function setLatePaymentFee(uint256 newLatePaymentFee) external override onlyRole(ADMIN_ROLE) {
        require(newLatePaymentFee <= 5000, "Fee exceeds maximum");
        
        latePaymentFee = newLatePaymentFee;
        
        emit LatePaymentFeeUpdated(newLatePaymentFee);
    }
    
    /**
     * @dev Set the default threshold in days
     * @param newDefaultThresholdDays The new default threshold in days
     */
    function setDefaultThreshold(uint256 newDefaultThresholdDays) external override onlyRole(ADMIN_ROLE) {
        require(newDefaultThresholdDays >= 1, "Threshold must be at least 1 day");
        require(newDefaultThresholdDays <= 180, "Threshold cannot exceed 180 days");
        
        defaultThresholdDays = newDefaultThresholdDays;
        
        emit DefaultThresholdUpdated(newDefaultThresholdDays);
    }
    
    /**
     * @dev Get the late payment fee
     * @return The late payment fee in basis points
     */
    function getLatePaymentFee() external view override returns (uint256) {
        return latePaymentFee;
    }
    
    /**
     * @dev Get the default threshold in days
     * @return The default threshold in days
     */
    function getDefaultThreshold() external view override returns (uint256) {
        return defaultThresholdDays;
    }
    
    /**
     * @dev Get the recipient of an invoice payment
     * @param tokenId The token ID
     * @return The recipient address
     */
    function getInvoiceRecipient(uint256 tokenId) external view override returns (address) {
        return IERC721(invoiceNFTAddress).ownerOf(tokenId);
    }
    
    /**
     * @dev Fallback function to accept payments
     */
    receive() external payable {
        // Emit an event or handle direct payments
    }
} 