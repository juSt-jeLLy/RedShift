// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IInvoiceNFT.sol";

/**
 * @title IRepaymentManager
 * @dev Interface for the Repayment Manager
 */
interface IRepaymentManager {
    // Events
    event RepaymentReceived(uint256 indexed tokenId, address indexed repayer, uint256 amount, uint256 timestamp);
    event RepaymentDistributed(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event LatePaymentFeeUpdated(uint256 newLatePaymentFee);
    event DefaultThresholdUpdated(uint256 newDefaultThresholdDays);
    
    // Functions
    function repayInvoice(uint256 tokenId) external payable;
    function processDefaultedInvoices() external;
    function getRepaymentStatus(uint256 tokenId) external view returns (
        bool isPaid,
        uint256 amountPaid,
        uint256 amountDue,
        uint256 dueDate,
        bool isLate,
        bool isDefaulted
    );
    function setLatePaymentFee(uint256 newLatePaymentFee) external;
    function setDefaultThreshold(uint256 newDefaultThresholdDays) external;
    function getLatePaymentFee() external view returns (uint256);
    function getDefaultThreshold() external view returns (uint256);
    function getInvoiceRecipient(uint256 tokenId) external view returns (address);
} 