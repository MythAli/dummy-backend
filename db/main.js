const { Pool, Client } = require("pg");
require("dotenv").config();

const pool = new Pool({
  ...JSON.parse(process.env.DB_CONFIG),
});

module.exports = {
  pool,
};

module.exports.fetchData = async (cmd, values) => {
  const res = await pool.query(cmd, values);
  return res;
};

module.exports.changeData = async (query, values) => {
  const client = await pool.connect();
  try {
    // Pass 'values' as the second argument so $1, $2, etc. are recognized
    const result = await client.query(query, values);
    return result;
  } finally {
    client.release();
  }
};

module.exports.executeTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // The 'callback' is a function where we pass the active client
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
