const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const diemSchema = mongoose.Schema({
    SVid: {type: mongoose.Schema.Types.ObjectId, required: true},
    MHid: {type: mongoose.Schema.Types.ObjectId, required: true},
    tp1: {type: Number, required: true},
    tp2: {type: Number, required: true},
    thi: {type: Number, required: true},
    kthp: {type: Number, required: true},
    danhgia: {type: Boolean, required: true},
});

diemSchema.index({SVid: 1, MHid: 1}, {unique: true});
diemSchema.path('SVid').ref('sinhvien');
diemSchema.path('MHid').ref('monhoc');

diemSchema.plugin(mongoosePaginate);
const diem = mongoose.model('diem', diemSchema);

module.exports = diem;