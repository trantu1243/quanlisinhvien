const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const khoahocSchema = mongoose.Schema({
    makhoahoc: {type: String, required: true, unique: true},
    tenkhoahoc: {type: String, required: true}
})

khoahocSchema.plugin(mongoosePaginate);
const khoahoc = mongoose.model('khoahoc', khoahocSchema);

module.exports = khoahoc;