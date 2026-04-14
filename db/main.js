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

module.exports.changeData = async (cmd) => {
  await pool.query(cmd);
};
