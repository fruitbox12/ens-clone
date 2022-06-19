// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import { StringUtils } from "./libraries/StringUtils.sol";
import "hardhat/console.sol";

contract DomainsBase {

  struct DomainInfo {
    string name;
    string url;
    string picture;
    string description;
    string[] accounts;
    string[] addresses;
  }

  string public tld;

  mapping(string => address) public domains;
  mapping(string => DomainInfo) public records;

  mapping (uint => string) public names;

  event NewDomain(uint domainId, string name);

  error Unauthorized();
  error AlreadyRegistered();
  error InvalidName(string name);

  function price(string calldata name) public pure returns(uint) {
    uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
    } else if (len == 4) {
      return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
    } else {
      return 1 * 10**17;
    }
  }

  function getAddress(string calldata name) public view returns (address) {
    return domains[name];
  }

  function setRecord(
    string calldata name,
    string memory _url,
    string memory _picture,
    string memory _description,
    string[] memory _accounts,
    string[] memory _addresses
  ) public {
    if (msg.sender != domains[name]) revert Unauthorized();
    records[name] =  DomainInfo(name, _url, _picture, _description, _accounts, _addresses);
  }

  function getRecord(string calldata name) public view returns(DomainInfo memory) {
    return records[name];
  }
}