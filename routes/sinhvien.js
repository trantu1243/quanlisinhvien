const express = require('express');
const Lop = require('../models/lop');
const Sinhvien = require('../models/sinhvien');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const router = express.Router();

function formatDate(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

function formatDate2(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


router.get("/", async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const masv = req.query.maSV || "";
    const malop = req.query.malop || "";
    const gioitinh = req.query.gioitinh || "";

    const limit = 10;

    let params = ''

    let matchCondition = {};

    if (masv) {
        matchCondition.maSV = masv;
        params += "&maSV=" + masv;
    }

    if (gioitinh) {
        matchCondition.gioitinh = gioitinh;
        params += "&gioitinh=" + gioitinh;
    }

    if (malop) {
        params += "&malop=" + malop;
    }

    try {
        const aggregateQuery = [
            { $match: matchCondition },
            {
                $lookup: {
                    from: 'lops',
                    localField: 'lopid',
                    foreignField: '_id',
                    as: 'lop_info'
                }
            },
            { $unwind: '$lop_info' },
            { $match: malop ? { 'lop_info.malop': malop } : {} },
            {
                $addFields: {
                    tenlop: '$lop_info.tenlop'
                }
            },
            {
                $project: {
                    maSV: 1,
                    tenSV: 1,
                    gioitinh: 1,
                    ngaysinh: 1,
                    quequan: 1,
                    tenlop: 1
                }
            }
        ];

        const sinhviens = await Sinhvien.aggregate(aggregateQuery);

        const formattedResult = sinhviens.map(sinhvien => ({
            ...sinhvien,
            ngaysinh: formatDate(sinhvien.ngaysinh)
        }));

        const docs = [];
        const totalPages = formattedResult.length % 10 === 0 ? formattedResult.length / 10 : formattedResult.length / 10+1;
        for (let i=(page-1)*10; i<page*10; i++){
            if (i < formattedResult.length) docs.push(formattedResult[i]);
        }

        res.render('sinhvien/index', { masv, malop, gioitinh, sinhviens: {
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
    } catch (error) {
        next(error);
    }
});


router.get('/add', async function(req, res, next) {
    const lops = await Lop.find();
    res.render('sinhvien/add', {lops, error: null, success: null});
});

router.get('/edit/:id', async function(req, res, next) {
    let lops = await Lop.find();
    const sinhvien = await Sinhvien.findById(req.params.id);
    const ngaysinh = formatDate2(sinhvien.ngaysinh);
    res.render('sinhvien/edit', {sinhvien, ngaysinh, lops, error: null, success: null});
});

router.post('/add', async function(req, res, next) {
    const lops = await Lop.find();
    try {
        let { maSV, tenSV, gioitinh, ngaysinh, lopid, quequan } = req.body;
        const existingSV = await Sinhvien.findOne({maSV});
        if (existingSV) {
            return res.render('sinhvien/add', { lops, error: 'Sinh viên đã tồn tại', success: null});
        }
  
        lopid = new ObjectId(lopid.toString());

        const sinhvien = new Sinhvien({ maSV, tenSV, gioitinh, ngaysinh, lopid, quequan });
        await sinhvien.save();
        res.render('sinhvien/add', { lops, error: null, success: "Thêm thành công"});
    } catch (error) {
        console.log(error);
        res.render('sinhvien/add', { lops, error: error.message , success: null});
    }
});

router.post('/edit/:id', async function(req, res, next) {
    const lops = await Lop.find();
    const sinhvien = await Sinhvien.findById(req.params.id);
    const ngaysinh = formatDate2(sinhvien.ngaysinh);
    try {
        let { maSV, tenSV, gioitinh, ngaysinh, lopid, quequan } = req.body;
   
        lopid = new ObjectId(lopid.toString());

        await Sinhvien.findByIdAndUpdate(req.params.id, { maSV, tenSV, gioitinh, ngaysinh, lopid, quequan });

        res.redirect(`/sinhvien/edit/${req.params.id}`);
    } catch (error) {
        console.log(error);
        res.render('sinhvien/edit', { sinhvien, ngaysinh, lops, error: error.message , success: null});
    }
});


router.post('/delete/:id', async function(req, res, next) {
    try{
        await Sinhvien.findByIdAndDelete(req.params.id);
        res.redirect(`/sinhvien?`);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;