const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const { isLoggedIn,isReviewAuthor,validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;