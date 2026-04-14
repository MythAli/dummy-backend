const { Pool, Client } = require("pg");
require("dotenv").config();

const pool = new Pool({
  ...JSON.parse(process.env.DB_CONFIG),
});

module.exports = {
  pool,
};

module.exports.fetchData = async (cmd) => {
  const res = await pool.query(cmd);
  return res;
};

// db/main.js - UPDATED
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
