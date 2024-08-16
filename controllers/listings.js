const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js")

module.exports.index = async (req, res) => {
    // Extract category from query parameters
    const { category } = req.query;
    
    // Build the query object based on the category parameter
    let query = {};
    if (category) {
        query.category = category; // Match listings with the specified category
    }
    
    // Fetch listings based on the query
    const allListings = await Listing.find(query);
    
    // Render the view with the filtered listings
    res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing does not exist");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing,mapToken:process.env.MAP_TOKEN});
};

module.exports.createListing = async (req,res,next)=>{
    const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(req.body.listing.location)}&apiKey=ee1f4c9d83e74f6bbe5c75a9b31ef7b2`);
    const data = await response.json();
    const [result] = data.features;

    let url = req.file.path;
    let filename = req.file.filename; 
    let categories = req.body.listing.category || [];
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = result.geometry;
    newListing.category = categories; // Ensure this is an array
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!!");
    res.redirect("/listings"); 
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist");
        res.redirect("/listings");
    }
    res.render(`./listings/edit.ejs`,{listing});
};

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    if(!req.body.listing){
        throw new ExpressError(400,"Enter valid listing data");
    }
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename; 
        listing.image = {url,filename};
        listing.save();
    }

    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    const dell = await Listing.findByIdAndDelete(id,{...req.body.listing});
    req.flash("success","Listing Deleted!!");
    res.redirect(`/listings`);
};