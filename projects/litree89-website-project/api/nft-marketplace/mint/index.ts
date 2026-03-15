import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticate } from "../../lib/auth";
import { ethers } from "ethers";
import { getSecret } from "../../lib/keyvault";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const { userId } = await authenticate(req);
    const { tokenURI } = req.body;
    if (!tokenURI) throw new Error("Missing tokenURI");

    const rpcUrl = await getSecret("ETH_RPC_URL");
    const privateKey = await getSecret("WALLET_PRIVATE_KEY"); // Platform signer
    const contractAddress = await getSecret("NFT_CONTRACT_ADDRESS");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, [
      "function mintNFT(address recipient, string memory tokenURI) public returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ], wallet);

    const tx = await contract.mintNFT(wallet.address, tokenURI); // Mint to platform, transfer to user if needed
    const receipt = await tx.wait();
    // Find tokenId from Transfer event
    const transferEvent = receipt.logs
      .map((log: any) => {
        try { return contract.interface.parseLog(log); } catch { return null; }
      })
      .find((e: any) => e && e.name === "Transfer");
    const tokenId = transferEvent ? transferEvent.args.tokenId.toString() : null;

    context.res = { status: 200, body: { success: true, txHash: tx.hash, tokenId } };
  } catch (err) {
    context.res = { status: 500, body: { error: (err as Error).message } };
  }
};

export default httpTrigger;
