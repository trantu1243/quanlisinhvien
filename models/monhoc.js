const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const monhocSchma = new mongoose.Schema({
    maMH: {type: String, required: true, unique: true},
    tenMH: {type: String, required: true},
    sotinchi: {type: Number, required: true},
});

monhocSchma.plugin(mongoosePaginate);
const monhoc = mongoose.model('monhoc', monhocSchma);

module.exports = monhoc;