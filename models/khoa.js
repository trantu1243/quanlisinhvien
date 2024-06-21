const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const khoaSchema = mongoose.Schema({
    makhoa: {type: String, required: true, unique: true},
    tenkhoa: {type: String, required: true}
});

khoaSchema.plugin(mongoosePaginate);
const khoa = mongoose.model('khoa', khoaSchema);

module.exports = khoa;