const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const sinhvienSchema = mongoose.Schema({
    maSV: {type: String, required: true, unique: true},
    tenSV: {type: String, required: true},
    gioitinh: {type: String, required: true, enum: ['nam', 'nữ']},
    ngaysinh: { type: Date, required: true },
    lopid: {type: mongoose.Schema.Types.ObjectId, required: true},
    quequan: { type: String, required: true }
});

sinhvienSchema.path('lopid').ref('lop');

sinhvienSchema.plugin(mongoosePaginate);
const sinhvien = mongoose.model('sinhvien', sinhvienSchema);

module.exports = sinhvien;