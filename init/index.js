const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"66b0f3ef4e734a5e94baac5a"}));
    const dataWithGeometry = await Promise.all(initData.data.map(async (d) => {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(d.location)}&apiKey=ee1f4c9d83e74f6bbe5c75a9b31ef7b2`);
        const data = await response.json();
        const [result] = data.features;

        // Ensure geometry is valid
        d.geometry = result.geometry || {
            type: "Point",
            coordinates: [0, 0]
        };

        return d;
    }));
    await Listing.insertMany(dataWithGeometry);
    console.log("index connected");
};

initDB();