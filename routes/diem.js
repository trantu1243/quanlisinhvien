const express = require('express');
const Monhoc = require('../models/monhoc');
const Sinhvien = require('../models/sinhvien');
const Diem = require('../models/diem');

const router = express.Router();

router.get('/', async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const options = {
        page,
        limit,
        populate: [
            { path: 'MHid', select: 'maMH tenMH' },
            { 
                path: 'SVid', 
                select: 'maSV tenSV lopid',
                populate: {
                    path: 'lopid',
                    select: 'tenlop' 
                }
            },
            
        ],
        select: 'MHid SVid tp1 tp2 thi kthp danhgia'
    };

    const result = await Diem.paginate({}, options);

    const formattedResult = result.docs.map(diem => ({
        _id: diem._id,
        maSV: diem.SVid.maSV,
        tenSV: diem.SVid.tenSV,
        tenlop:  diem.SVid.lopid.tenlop,
        maMH: diem.MHid.maMH,
        tenMH: diem.MHid.tenMH,
        tp1: diem.tp1,
        tp2: diem.tp2,
        thi: diem.thi,
        kthp: diem.kthp,
        danhgia: diem.danhgia
    }));
    const diems =  {
        docs: formattedResult,
        totalDocs: result.totalDocs,
        limit: result.limit,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextPage: result.nextPage,
        prevPage: result.prevPage
    };

    res.render('diem/index', {diems});
});

router.get('/add', function(req, res, next) {
    res.render('diem/add', { error: null, success: null });
});

router.get('/edit/:id', async function(req, res, next) {
    const diem = await Diem.findById(req.params.id);
    const sinhvien = await Sinhvien.findById(String(diem.SVid));
    const monhoc = await Monhoc.findById(String(diem.MHid));
    const masv = sinhvien.maSV;
    const mamh = monhoc.maMH;
    res.render('diem/edit', {diem, masv, mamh, error: null, success: null});
});


router.post('/add', async function(req, res, next) {
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

router.post('/edit/:id', async function(req, res, next) {
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

router.post('/delete/:id', async function(req, res, next) {
    try{
        await Diem.findByIdAndDelete(req.params.id);
        res.redirect("/diem");
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;