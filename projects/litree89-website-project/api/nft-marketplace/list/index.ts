import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { authenticate } from "../../lib/auth";
import { ethers } from "ethers";
import { getSecret } from "../../lib/keyvault";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const { userId } = await authenticate(req);
    const { tokenId, price } = req.body;  // price in wei or 0 to delist

    const rpcUrl = await getSecret("ETH_RPC_URL");
    const privateKey = await getSecret("WALLET_PRIVATE_KEY");  // Platform signer
    const contractAddress = await getSecret("NFT_CONTRACT_ADDRESS");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, [
      "function listToken(uint256 tokenId, uint256 price) public",
      "function delistToken(uint256 tokenId) public"
    ], wallet);

    const tx = price > 0 
      ? await contract.listToken(tokenId, price)
      : await contract.delistToken(tokenId);
    await tx.wait();

    context.res = { status: 200, body: { success: true, txHash: tx.hash } };
  } catch (err) {
    context.res = { status: 500, body: { error: (err as Error).message } };
  }
};

export default httpTrigger;
