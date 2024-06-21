const express = require('express');
const Monhoc = require('../models/monhoc');
const Sinhvien = require('../models/sinhvien');
const Diem = require('../models/diem');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const maSV = req.query.maSV || "";
    const maMH = req.query.maMH || "";
    const malop = req.query.malop || "";
    const danhgia = req.query.danhgia || "";

    let matchCondition = {};

    let params = '';

    if (maSV) {
        const sinhvien = await Sinhvien.findOne({ maSV });
        if (sinhvien) {
            matchCondition.SVid = sinhvien._id;
        } else {
            matchCondition.SVid = "-1";
        }
        params += "&maSV=" + maSV;
    }

    if (maMH) {
        const monhoc = await Monhoc.findOne({ maMH });
        if (monhoc) {
            matchCondition.MHid = monhoc._id;
        } else {
            matchCondition.MHid = "-1";
        }
        params += "&maMH=" + maMH;
    }

    if (danhgia) {
        matchCondition.danhgia = danhgia === '1';
        params += "&danhgia=" + danhgia;
    }

    if (malop) {
        params += "&malop=" + malop;
    }

    try {
        const aggregateQuery = [
            { $match: matchCondition },
            {
                $lookup: {
                    from: 'sinhviens',
                    localField: 'SVid',
                    foreignField: '_id',
                    as: 'sinhvien_info'
                }
            },
            { $unwind: '$sinhvien_info' },
            {
                $lookup: {
                    from: 'lops',
                    localField: 'sinhvien_info.lopid',
                    foreignField: '_id',
                    as: 'lop_info'
                }
            },
            { $unwind: '$lop_info' },
            {
                $lookup: {
                    from: 'monhocs',
                    localField: 'MHid',
                    foreignField: '_id',
                    as: 'monhoc_info'
                }
            },
            { $unwind: '$monhoc_info' },
            {
                $match: malop ? { 'lop_info.malop': malop } : {}
            },
            {
                $project: {
                    _id: 1,
                    maSV: '$sinhvien_info.maSV',
                    tenSV: '$sinhvien_info.tenSV',
                    tenlop: '$lop_info.tenlop',
                    maMH: '$monhoc_info.maMH',
                    tenMH: '$monhoc_info.tenMH',
                    tp1: 1,
                    tp2: 1,
                    thi: 1,
                    kthp: 1,
                    danhgia: 1
                }
            }
        ];
    
        const formattedResult = await Diem.aggregate(aggregateQuery);

        const docs = [];
        const totalPages = Math.ceil(formattedResult.length / 10);;
        for (let i=(page-1)*10; i<page*10; i++){
            if (i < formattedResult.length) docs.push(formattedResult[i]);
        }

        res.render('diem/index', { maSV, malop, maMH, danhgia, diems: {
            docs: docs,
            totalDocs: formattedResult.length,
            limit,
            page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            params
        }});
    }
    catch (e) {
        console.log(e);
    }
});

router.get('/add', authMiddleware, function(req, res, next) {
    res.render('diem/add', { error: null, success: null });
});

router.get('/edit/:id', authMiddleware, async function(req, res, next) {
    const diem = await Diem.findById(req.params.id);
    const sinhvien = await Sinhvien.findById(String(diem.SVid));
    const monhoc = await Monhoc.findById(String(diem.MHid));
    const masv = sinhvien.maSV;
    const mamh = monhoc.maMH;
    res.render('diem/edit', {diem, masv, mamh, error: null, success: null});
});


router.post('/add', authMiddleware, async function(req, res, next) {
    try {
        const { maSV, maMH, tp1, tp2, thi} = req.body;
        const sinhvien = await Sinhvien.findOne({maSV});
        const monhoc = await Monhoc.findOne({maMH});
        
        if (!sinhvien) {
            return res.render('diem/add', { error: 'Sinh viên không tồn tại', success: null });
        }
        if (!monhoc) {
            return res.render('diem/add', { error: 'Môn học không tồn tại', success: null });
        }

        const SVid = sinhvien._id;
        const MHid = monhoc._id;

        let kthp = (tp1*0.7 + tp2*0.3)*0.3 + thi*0.7;
        kthp = parseFloat(kthp.toFixed(1));
        const danhgia = (kthp >= 4 && (tp1*0.7 + tp2*0.3) >= 4 && thi>=4 );
        const diem = new Diem({ SVid, MHid, tp1, tp2, thi, kthp, danhgia });
        diem.save();
        res.render('diem/add', {error: null, success: "Thêm thành công"});

    } catch (error) {
        console.log(error);
        res.render('diem/add', { error: error.message, success: null });
    }
});

router.post('/edit/:id', authMiddleware, async function(req, res, next) {
    const diem = await Diem.findById(req.params.id);
    const sinhvien = await Sinhvien.findById(String(diem.SVid));
    const monhoc = await Monhoc.findById(String(diem.MHid));
    const masv = sinhvien.maSV;
    const mamh = monhoc.maMH;
    try {
        const { maSV, maMH, tp1, tp2, thi} = req.body;
        const sinhvien = await Sinhvien.findOne({maSV});
        const monhoc = await Monhoc.findOne({maMH});
        
        if (!sinhvien) {
            return res.render('diem/edit', {diem, masv, mamh,  error: 'Sinh viên không tồn tại', success: null});
        }
        if (!monhoc) {
            return res.render('diem/edit', {diem, masv, mamh,  error: 'Môn học không tồn tại', success: null});
        }

        const SVid = sinhvien._id;
        const MHid = monhoc._id;

        let kthp = (tp1*0.7 + tp2*0.3)*0.3 + thi*0.7;
        kthp = parseFloat(kthp.toFixed(1));
        const danhgia = (kthp >= 4 && (tp1*0.7 + tp2*0.3) >= 4 && thi >= 4);
        await Diem.findByIdAndUpdate(req.params.id, { SVid, MHid, tp1, tp2, thi, kthp, danhgia });
        
        res.redirect(`/diem/edit/${req.params.id}`);

    } catch (error) {
        console.log(error);
        res.render('diem/edit', {diem, masv, mamh,  error: error.message, success: null});
    }
});

router.post('/delete/:id', authMiddleware, async function(req, res, next) {
    try{
        await Diem.findByIdAndDelete(req.params.id);
        res.redirect("/diem");
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;