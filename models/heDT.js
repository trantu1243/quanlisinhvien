const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const heDTSchema = mongoose.Schema({
    maheDT: {type: String, required: true, unique: true},
    tenheDT: {type: String, required: true}
});

heDTSchema.plugin(mongoosePaginate);
const heDT = mongoose.model('heDT', heDTSchema);

module.exports = heDT;
