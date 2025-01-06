// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Nft is ERC1155 {
    address public owner;
    uint256 public cost;
    uint256 private _nextTokenId;

    constructor(
        string memory _uri,
        uint256 _initialSupply,
        uint256 _cost
    ) ERC1155(_uri) {
        owner = msg.sender;
        cost = _cost;
        _mint(owner, _nextTokenId, _initialSupply, "");
        _nextTokenId++;
    }

    function mint(uint256 amount) public payable {
        require(msg.value >= cost, "Insufficient payment");

        _mint(msg.sender, _nextTokenId, amount, "");
        _nextTokenId++;
    }

    function totalSupply(uint256 tokenId) public view returns (uint256) {
        return balanceOf(msg.sender, tokenId);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
