const sha256 = require("js-sha256").sha256;
const { generateLogInData } = require("./helpers/generateLogInData.js");
const { fetchData, executeTransaction } = require("../../db/main.js");
const { UserType } = require("../../helpers/constants.js");

const registerHandler = async (req, res) => {
  // Recieving client information:
  const data = req.body;
  const email = data.email?.toLowerCase();
  const password = data.password;
  const userType = data.table === 1 ? UserType.STUDENT : UserType.CLUB;
  const tableName =
    userType === UserType.STUDENT ? "student_users" : "club_users";
  const hashedPassword = sha256(password); // Hashing password

  try {
    // Comparing used emails:
    const checkData = await fetchData(
      `SELECT id, email FROM ${tableName} WHERE email = $1`,
      [email],
    );

    if (checkData.rows?.length)
      return res.status(409).json({
        error: "This email is already registered. Please try logging in.",
      });

    const logInData = await executeTransaction(async (client) => {
      let userId;
      if (userType === UserType.STUDENT) {
        const firstName = data.firstName?.toLowerCase();
        const lastName = data.lastName?.toLowerCase();

        //Registering account:
        // Register account with default dates
        // CURRENT_DATE - INTERVAL '2 days' gives you 2 days ago at 00:00:00
        // CURRENT_DATE + INTERVAL '2 days' gives you 2 days from now at 00:00:00
        const studentQuery = `
        INSERT INTO student_users (
            email, first_name, last_name, password, 
            calendar_start, calendar_end
        ) VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days') RETURNING id;
      `;
        const studentRes = await client.query(studentQuery, [
          email,
          firstName,
          lastName,
          hashedPassword,
        ]);
        userId = studentRes.rows[0].id;
      } else {
        // --- CLUB PATH ---
        // A. Create the Club User
        const userRes = await client.query(
          `
          INSERT INTO club_users (club_name, email, password)
          VALUES ($1, $2, $3) RETURNING id;
        `,
          [data.name, email, hashedPassword],
        );
        userId = userRes.rows[0].id;

        // B. Create the Club (Logic from your addClub.js)
        const clubRes = await client.query(
          `
          INSERT INTO clubs (
            name, about, logo_url, contact_email, 
            officers, instagram_url, website_url, twitter_url, owner_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id;
        `,
          [
            data.name,
            data.about,
            data.logo_url,
            data.contact_email,
            JSON.stringify(data.officers || []),
            data.instagram_url,
            data.website_url,
            data.twitter_url,
            userId,
          ],
        );
        const newClubId = clubRes.rows[0].id;

        // C. Handle Tags
        if (data.tags && Array.isArray(data.tags)) {
          for (const rawTagName of data.tags) {
            // Standardize to lowercase to match potential existing tags
            const tagName = rawTagName.toLowerCase().trim();

            // Insert tag if it doesn't exist
            await client.query(
              "INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT (tag_name) DO NOTHING",
              [tagName],
            );

            // Map the tag using the standardized name
            await client.query(
              `
                INSERT INTO club_tags (club_id, tag_id)
                SELECT $1, id FROM tags WHERE tag_name = $2
                ON CONFLICT DO NOTHING;
              `,
              [newClubId, tagName],
            );
          }
        }
      }

      // Generate the response data while still inside (or just return the info)
      return generateLogInData(userId, email, userType);
    });
    res.status(201).json(logInData);
  } catch (err) {
    console.error("Registration Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during registration." });
  }
};

module.exports = registerHandler;
