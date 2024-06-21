const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const authMiddleware = require('../middleware/auth');
const Lop = require('../models/lop');
const Khoa = require('../models/khoa');
const Khoahoc = require('../models/khoahoc');
const HeDT = require('../models/heDT');

router.get('/', authMiddleware, async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const options = {
        page,
        limit,
        populate: [
            { path: 'khoaid', select: 'tenkhoa' },
            { path: 'heDTid', select: 'tenheDT' },
            { path: 'khoahocid', select: 'tenkhoahoc' }
        ],
        select: 'malop tenlop khoaid heDTid khoahocid'
    };

    const result = await Lop.paginate({}, options);

    const formattedResult = result.docs.map(lop => ({
        _id: lop._id,
        malop: lop.malop,
        tenlop: lop.tenlop,
        tenkhoa: lop.khoaid.tenkhoa,
        tenheDT: lop.heDTid.tenheDT,
        tenkhoahoc: lop.khoahocid.tenkhoahoc
    }));

    const lops =  {
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

    res.render('lop/index', {lops});
});

router.get('/add', authMiddleware, async function(req, res, next) {
    const khoas = await Khoa.find();
    const khoahocs = await Khoahoc.find();
    const heDTs = await HeDT.find();
    res.render('lop/add', {khoas, khoahocs, heDTs, error: null, success: null});
});

router.get('/edit/:id', authMiddleware, async function(req, res, next) {
    const lop = await Lop.findById(req.params.id);
    const khoas = await Khoa.find();
    const khoahocs = await Khoahoc.find();
    const heDTs = await HeDT.find();
    res.render('lop/edit', {lop, khoas, khoahocs, heDTs, error: null, success: null});
});

router.post('/add', authMiddleware, async function(req, res, next) {
    const khoas = await Khoa.find();
    const khoahocs = await Khoahoc.find();
    const heDTs = await HeDT.find();
    try {
        let { malop, tenlop, khoaid, heDTid, khoahocid} = req.body;
        const existinglop = await Lop.findOne({malop});
        if (existinglop) {
            return res.render('lop/add', {khoas, khoahocs, heDTs, error: 'Lớp đã tồn tại', success: null});
        }

        khoaid = new ObjectId(khoaid.toString());
        heDTid = new ObjectId(heDTid.toString());
        khoahocid = new ObjectId(khoahocid.toString());
        const lop = new Lop({malop, tenlop, khoaid, heDTid, khoahocid});
        await lop.save();
        res.render('lop/add', {khoas, khoahocs, heDTs, error: null, success: "Thêm thành công"});
    } catch (error) {
        res.render('lop/add', {khoas, khoahocs, heDTs, error: error.message , success: null});
    }
});

router.post('/edit/:id', authMiddleware, async function(req, res, next) {
    const khoas = await Khoa.find();
    const khoahocs = await Khoahoc.find();
    const heDTs = await HeDT.find();
    try {
        let { malop, tenlop, khoaid, heDTid, khoahocid} = req.body;

        khoaid = new ObjectId(khoaid.toString());
        heDTid = new ObjectId(heDTid.toString());
        khoahocid = new ObjectId(khoahocid.toString());
        await Lop.findByIdAndUpdate(req.params.id, {malop, tenlop, khoaid, heDTid, khoahocid});
        res.redirect(`/lop/edit/${req.params.id}`);
    } catch (error) {
        res.render('lop/edit', {khoas, khoahocs, heDTs, error: error.message , success: null});
    }
});

router.post('/delete/:id', authMiddleware, async function(req, res, next){
    try{
        await Lop.findByIdAndDelete(req.params.id);
        res.redirect("/lop");
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;