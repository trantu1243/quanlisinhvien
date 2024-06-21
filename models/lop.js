const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const lopSchema = mongoose.Schema({
    malop: {type: String, required: true, unique: true},
    tenlop: {type: String, required: true},
    khoaid: {type: mongoose.Schema.Types.ObjectId, required: true},
    heDTid: {type: mongoose.Schema.Types.ObjectId, required: true},
    khoahocid: {type: mongoose.Schema.Types.ObjectId, required: true},
});

lopSchema.path('khoaid').ref('khoa');
lopSchema.path('heDTid').ref('heDT');
lopSchema.path('khoahocid').ref('khoahoc');

lopSchema.plugin(mongoosePaginate);
const lop = mongoose.model('lop', lopSchema);

module.exports = lop;
