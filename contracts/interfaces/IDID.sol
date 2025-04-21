// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDID
 * @dev Interface for the DID (Decentralized Identifier) Registry
 */
interface IDID {
    // Events
    event DIDRegistered(address indexed owner, string did);
    event DIDTransferred(string indexed did, address indexed previousOwner, address indexed newOwner);
    event DIDAttributeChanged(string indexed did, string key, string value, uint256 validTo, uint256 previousChange);

    // Functions
    function registerDID(string calldata did) external;
    function transferDID(string calldata did, address newOwner) external;
    function setDIDAttribute(string calldata did, string calldata key, string calldata value, uint256 validity) external;
    function revokeAttribute(string calldata did, string calldata key) external;
    function isDIDOwner(string calldata did, address owner) external view returns (bool);
    function getDIDOwner(string calldata did) external view returns (address);
    function getDIDAttribute(string calldata did, string calldata key) external view returns (string memory, uint256, uint256);
    function isDIDRegistered(string calldata did) external view returns (bool);
} 