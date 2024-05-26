const mongoose = require('mongoose');
const { type } = require('os');
const countrySubSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    sl_no: {
        type: Number,
        required: true
    }
});
const countrySchema = new mongoose.Schema({
    countries: [countrySubSchema]
});
const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
