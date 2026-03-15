// contracts/LiTreeNFT.sol (Updated with Royalty & Basic Listing)
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LiTreeNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Royalty info (EIP-2981)
    uint256 public constant ROYALTY_BASIS_POINTS = 1000; // 10% royalty (1000 / 10000)

    // Simple listing for marketplace
    mapping(uint256 => uint256) public tokenPrices; // tokenId => price in wei (0 = not for sale)

    constructor() ERC721("LiTreeLabStudio NFT", "LTNFT") Ownable(msg.sender) {}

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    // List token for sale
    function listToken(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        tokenPrices[tokenId] = price;
    }

    // Delist token
    function delistToken(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        tokenPrices[tokenId] = 0;
    }

    // Buy token
    function buyToken(uint256 tokenId) public payable {
        uint256 price = tokenPrices[tokenId];
        require(price > 0, "Not for sale");
        require(msg.value == price, "Incorrect payment");

        address seller = ownerOf(tokenId);
        tokenPrices[tokenId] = 0; // Remove from sale
        _transfer(seller, msg.sender, tokenId);

        // Pay seller (minus royalty)
        uint256 royalty = (price * ROYALTY_BASIS_POINTS) / 10000;
        payable(owner()).transfer(royalty);
        payable(seller).transfer(price - royalty);
    }

    // EIP-2981 royalty info
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        return (owner(), (salePrice * ROYALTY_BASIS_POINTS) / 10000);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
