// server/userDb.js
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database("YourDatabase");
const container = database.container("Users");

const PACK_PRICES = {
  small: 499, // $4.99 in cents
  medium: 999, // $9.99
  large: 1899, // $18.99
};

async function getUser(userId) {
  const { resource } = await container.item(userId, userId).read();
  return resource;
}

async function updateUser(userId, updates) {
  const { resource } = await container.item(userId, userId).replace({
    id: userId,
    ...updates,
  });
  return resource;
}

async function buyPack(userId, packType) {
  if (!PACK_PRICES[packType]) throw new Error("Invalid pack type");

  const user = await getUser(userId);
  if (!user.packs) user.packs = { small: 0, medium: 0, large: 0 };

  const packAmounts = {
    small: 5,
    medium: 12,
    large: 30,
  };

  user.packs[packType] += packAmounts[packType];

  await updateUser(userId, { packs: user.packs });
  return user.packs;
}

function getPackPrice(packType) {
  return PACK_PRICES[packType] || null;
}

module.exports = {
  getUser,
  updateUser,
  buyPack,
  getPackPrice,
};
