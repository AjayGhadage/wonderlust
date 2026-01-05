const Listing = require("../models/listing");
const catchAsync = require("../utils/catchAsync");

module.exports.index = catchAsync(async (req, res) => {
  const listings = await Listing.find({});
  return res.render("listings/index", { listings });
});

module.exports.renderNewForm = (req, res) => {
  return res.render("listings/new");
};

module.exports.createListing = catchAsync(async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();
  req.flash("success", "New listing created!");
  return res.redirect("/listings");
});

module.exports.showListing = catchAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" },
    });

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  return res.render("listings/show", { listing });
});

module.exports.renderEditForm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  return res.render("listings/edit", { listing });
});

module.exports.updateListing = catchAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  return res.redirect(`/listings/${id}`);
});

module.exports.deleteListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  return res.redirect("/listings");
});
