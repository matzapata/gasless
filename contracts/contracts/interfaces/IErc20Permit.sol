// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

// Define an interface that combines IERC20 and IERC20Permit
interface IERC20WithPermit is IERC20, IERC20Metadata, IERC20Permit {
    function version() external pure returns (string memory);
}
