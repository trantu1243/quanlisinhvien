const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const Khoa = require('../models/khoa');

router.get('/', authMiddleware, async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const khoas = await Khoa.paginate({}, { page, limit }, function (err, result) {
        return result;
    });
    res.render('khoa/index', { khoas });
});

router.get('/add', authMiddleware, function(req, res, next) {
    res.render('khoa/add', {error: null, success: null});
});

router.get('/edit/:id', authMiddleware, async function(req, res, next){
    const khoa = await Khoa.findById(req.params.id);
    res.render('khoa/edit', { khoa, error: null, success: null });
});

router.post('/add', authMiddleware, async function(req, res, next){
    try {
        const { makhoa, tenkhoa } = req.body;
        const existingkhoa = await Khoa.findOne({makhoa});
        if (existingkhoa) {
            return res.render('khoa/add', {error: "Hệ ĐT đã tồn tại", success: null});
        }

        const khoa = new Khoa({ makhoa, tenkhoa });
        await khoa.save();
        res.render('khoa/add', {error: null, success: "Thêm thành công"});
    } catch (error) {
        res.render('khoa/add', {error: error.message, success: null});
    }
})

router.post('/edit/:id', authMiddleware, async function(req, res, next){
    const khoa = await Khoa.findById(req.params.id);
    try{
        const { makhoa, tenkhoa } = req.body;
        const khoa = await Khoa.findByIdAndUpdate(req.params.id, { makhoa, tenkhoa });
        res.redirect(`/khoa/edit/${req.params.id}`);
    } catch (error) {
        res.render('khoa/edit', { khoa, error: error.message, success: null });
    }
})

router.post('/delete/:id', authMiddleware, async function(req, res, next){
    try{
        await Khoa.findByIdAndDelete(req.params.id);
        res.redirect("/khoa");
    } catch (error) {
        console.log(error);
    }
})
  
module.exports = router;