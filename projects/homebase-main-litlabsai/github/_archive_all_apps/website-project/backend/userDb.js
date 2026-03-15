// backend/userDb.js
// Cosmos DB helpers for user registration and login
const { getClient } = require("./cosmos");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const DB_NAME = process.env.COSMOS_DB_NAME || "main";
const CONTAINER = "users";

async function getUserContainer() {
  const client = await getClient();
  const db = client.database(DB_NAME);
  const { container } = await db.containers.createIfNotExists({
    id: CONTAINER,
  });
  return container;
}

async function findUserByEmail(email) {
  const container = await getUserContainer();
  const query = {
    query: "SELECT * FROM c WHERE c.email = @email",
    parameters: [{ name: "@email", value: email }],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources[0] || null;
}

// Subscription tiers: 'free', 'premium', 'pro', 'enterprise'
// Packs: one-time purchases for features/content
async function createUser({ email, password, name }) {
  const container = await getUserContainer();
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email,
    password: hash,
    name,
    createdAt: new Date().toISOString(),
    subscription: {
      tier: "free", // default tier
      status: "inactive", // 'active', 'inactive', 'canceled', 'trial'
      renewalDate: null,
      lastPayment: null,
      paymentProvider: null, // e.g., 'stripe', 'coinbase', 'googlepay'
      history: [], // [{date, amount, provider, status}]
    },
    packs: [], // [{ packId, name, purchaseDate, price, provider, status }]
  };
  await container.items.create(user);
  return user;
}

// Add a purchased pack to a user
async function addUserPack(userId, pack) {
  const container = await getUserContainer();
  const { resource } = await container.item(userId, userId).read();
  if (!resource) throw new Error("User not found");
  if (!resource.packs) resource.packs = [];
  resource.packs.push({ ...pack, purchaseDate: new Date().toISOString() });
  await container.items.upsert(resource);
  return resource;
}

async function updateUserSubscription(userId, subscription) {
  const container = await getUserContainer();
  // Patch only the subscription field
  const { resource } = await container.item(userId, userId).read();
  if (!resource) throw new Error("User not found");
  resource.subscription = { ...resource.subscription, ...subscription };
  await container.items.upsert(resource);
  return resource;
}

async function getUserById(userId) {
  const container = await getUserContainer();
  const { resource } = await container.item(userId, userId).read();
  return resource;
}

module.exports = {
  findUserByEmail,
  createUser,
  updateUserSubscription,
  getUserById,
  addUserPack,
};
