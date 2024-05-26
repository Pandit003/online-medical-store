var mongoose = require('mongoose');
var medicineSchema = new mongoose.Schema({
    aggregateRating: {
        ratingValue: String,
        ratingCount: String
    },
    name: String,
    image: String,
    sku: String,
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
});
module.exports = mongoose.model('babyneeds', medicineSchema);
 