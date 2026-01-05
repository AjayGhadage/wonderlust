require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");
const { data } = require("./data");

const MONGO_URL = process.env.ATLASDB_URL;

console.log("SEED ENV CHECK:", MONGO_URL);

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("DB connected");
}

main()
  .then(async () => {
    await Listing.deleteMany({});
    console.log("Old listings deleted");

    const user = await User.findOne();
    if (!user) {
      throw new Error("No user found. Please register a user first.");
    }

    const listingsWithOwner = data.map(listing => ({
      ...listing,
      owner: user._id,
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log("Sample listings added");

    mongoose.connection.close();
  })
  .catch(err => {
    console.log(err);
  });
