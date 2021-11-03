// contracts/ContractFactoryNFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
// import "./Collection.sol";

contract Collection is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory myName, string memory mySymbol) ERC721(myName, mySymbol) {
    }

    function mint(address player, string[] memory tokenURI, uint totalSupply) public {
        for(uint256 i = 0; i < totalSupply; i++){
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(player, newItemId);
            _setTokenURI(newItemId, tokenURI[i]);
        }
    }
}


contract ContractFactoryNFT {
    address[] public contracts;
    address public lastContractAddress;       

    function getContractCount() public view returns(uint contractCount) {
        return contracts.length;
    }

     // deploy a new purchase contract
    function deploy(string memory name, string memory symbol, string[] memory tokenURI, uint256 totalSupply) public returns(address newContract){
         Collection c = new Collection(name,symbol);
         address cAddr = address(c);
         contracts.push(cAddr);
         lastContractAddress = cAddr;
         c.mint(msg.sender, tokenURI, totalSupply);
         return cAddr;
    }  

    // function mint(Collection tokenAddress, string memory tokenURI) public {
    //   tokenAddress.mint(msg.sender, tokenURI);
    // }       
}