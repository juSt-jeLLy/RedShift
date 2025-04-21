// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDID.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DIDRegistry
 * @dev Implementation of the DID (Decentralized Identifier) Registry
 */
contract DIDRegistry is IDID, AccessControl {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Mappings
    mapping(string => address) private _didToOwner;
    mapping(string => mapping(string => AttributeValue)) private _didAttributes;
    mapping(string => bool) private _registeredDIDs;
    
    // Struct to store attribute values and their validity
    struct AttributeValue {
        string value;
        uint256 validTo;
        uint256 updatedAt;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new DID
     * @param did The DID to register
     */
    function registerDID(string calldata did) external override {
        require(!_registeredDIDs[did], "DID already registered");
        
        _didToOwner[did] = msg.sender;
        _registeredDIDs[did] = true;
        
        emit DIDRegistered(msg.sender, did);
    }
    
    /**
     * @dev Transfer a DID to a new owner
     * @param did The DID to transfer
     * @param newOwner The new owner address
     */
    function transferDID(string calldata did, address newOwner) external override {
        require(_didToOwner[did] == msg.sender, "Not the DID owner");
        require(newOwner != address(0), "New owner cannot be zero address");
        
        address previousOwner = _didToOwner[did];
        _didToOwner[did] = newOwner;
        
        emit DIDTransferred(did, previousOwner, newOwner);
    }
    
    /**
     * @dev Set an attribute for a DID
     * @param did The DID
     * @param key The attribute key
     * @param value The attribute value
     * @param validity The validity period in seconds
     */
    function setDIDAttribute(
        string calldata did, 
        string calldata key, 
        string calldata value, 
        uint256 validity
    ) external override {
        require(_didToOwner[did] == msg.sender || hasRole(VERIFIER_ROLE, msg.sender), "Not authorized");
        
        uint256 validTo = validity > 0 ? block.timestamp + validity : 0;
        uint256 previousChange = _didAttributes[did][key].updatedAt;
        
        _didAttributes[did][key] = AttributeValue({
            value: value,
            validTo: validTo,
            updatedAt: block.timestamp
        });
        
        emit DIDAttributeChanged(did, key, value, validTo, previousChange);
    }
    
    /**
     * @dev Revoke an attribute for a DID
     * @param did The DID
     * @param key The attribute key to revoke
     */
    function revokeAttribute(string calldata did, string calldata key) external override {
        require(_didToOwner[did] == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        uint256 previousChange = _didAttributes[did][key].updatedAt;
        delete _didAttributes[did][key];
        
        emit DIDAttributeChanged(did, key, "", 0, previousChange);
    }
    
    /**
     * @dev Check if an address is the owner of a DID
     * @param did The DID to check
     * @param owner The address to verify
     * @return True if the address is the owner
     */
    function isDIDOwner(string calldata did, address owner) external view override returns (bool) {
        return _didToOwner[did] == owner;
    }
    
    /**
     * @dev Get the owner of a DID
     * @param did The DID
     * @return The owner address
     */
    function getDIDOwner(string calldata did) external view override returns (address) {
        return _didToOwner[did];
    }
    
    /**
     * @dev Get an attribute of a DID
     * @param did The DID
     * @param key The attribute key
     * @return The attribute value, validity timestamp and update timestamp
     */
    function getDIDAttribute(
        string calldata did, 
        string calldata key
    ) external view override returns (string memory, uint256, uint256) {
        AttributeValue memory attr = _didAttributes[did][key];
        
        // Check if the attribute has expired
        if (attr.validTo > 0 && attr.validTo < block.timestamp) {
            return ("", 0, attr.updatedAt);
        }
        
        return (attr.value, attr.validTo, attr.updatedAt);
    }
    
    /**
     * @dev Check if a DID is registered
     * @param did The DID to check
     * @return True if the DID is registered
     */
    function isDIDRegistered(string calldata did) external view override returns (bool) {
        return _registeredDIDs[did];
    }
} 