var mongoose = require('mongoose');
var cartSchema = new mongoose.Schema({
    aggregateRating: {
        ratingValue: String,
        ratingCount: String
    },
    name: String,
    image: String,
    sku: String,
    // availability: String,
    brand: {
        name: String
    },
    productID: String,
    description: String,
    offers: {
        priceCurrency: String,
        offerCount: Number,
        price: Number,
        url: String
    },
    dosageForm : String,
    activeIngredient: String,
    userId: String,
    productcatagory: String
});
module.exports = mongoose.model('cartinfo', cartSchema);
 