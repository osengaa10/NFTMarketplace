// contracts/NFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
// pragma solidity ^0.8.4;

// import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "hardhat/console.sol";


// contract Collection is ERC721URIStorage {

//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;

//     constructor(string memory myName, string memory mySymbol) ERC721(myName, mySymbol) {
//     }

//     function mint(address player, string memory tokenURI, uint totalSupply) public {
//         for(uint256 i = 1; i<= totalSupply; i++){
//             _tokenIds.increment();
//             uint256 newItemId = _tokenIds.current();
//             _mint(player, newItemId);
//             _setTokenURI(newItemId, tokenURI);
//         }
//     }
// }
