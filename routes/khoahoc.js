const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const Khoahoc = require('../models/khoahoc');

router.get('/', authMiddleware, async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const khoahocs = await Khoahoc.paginate({}, { page, limit }, function (err, result) {
        return result;
    });
    res.render('khoahoc/index', { khoahocs });
});

router.get('/add', authMiddleware, function(req, res, next) {
    res.render('khoahoc/add', {error: null, success: null});
});

router.get('/edit/:id', authMiddleware, async function(req, res, next){
    const khoahoc = await Khoahoc.findById(req.params.id);
    res.render('khoahoc/edit', { khoahoc, error: null, success: null });
});

router.post('/add', authMiddleware, async function(req, res, next){
    try {
        const { makhoahoc, tenkhoahoc } = req.body;
        const existingkhoahoc = await Khoahoc.findOne({makhoahoc});
        if (existingkhoahoc) {
            return res.render('khoahoc/add', {error: "Hệ ĐT đã tồn tại", success: null});
        }

        const khoahoc = new Khoahoc({ makhoahoc, tenkhoahoc });
        await khoahoc.save();
        res.render('khoahoc/add', {error: null, success: "Thêm thành công"});
    } catch (error) {
        res.render('khoahoc/add', {error: error.message, success: null});
    }
})

router.post('/edit/:id', authMiddleware, async function(req, res, next){
    const khoahoc = await Khoahoc.findById(req.params.id);
    try{
        const { makhoahoc, tenkhoahoc } = req.body;
        const khoahoc = await Khoahoc.findByIdAndUpdate(req.params.id, { makhoahoc, tenkhoahoc });
        res.redirect(`/khoahoc/edit/${req.params.id}`);
    } catch (error) {
        res.render('khoahoc/edit', { khoahoc, error: error.message, success: null });
    }
})

router.post('/delete/:id', authMiddleware, async function(req, res, next){
    try{
        await Khoahoc.findByIdAndDelete(req.params.id);
        res.redirect("/khoahoc");
    } catch (error) {
        console.log(error);
    }
})
  
module.exports = router;