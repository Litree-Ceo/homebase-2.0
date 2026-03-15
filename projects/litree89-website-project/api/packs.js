// api/packs.js
const { buyPack } = require("../backend/userDb.js");

module.exports = async function (context, req) {
  const { userId, packType } = req.body;
  try {
    const user = await buyPack(userId, packType);
    context.res = { status: 200, body: { message: "Pack purchased", user } };
  } catch (error) {
    context.res = { status: 400, body: { error: error.message } };
  }
};
