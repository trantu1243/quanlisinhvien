const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const Monhoc = require('../models/monhoc');

router.get('/', authMiddleware, async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const monhocs = await Monhoc.paginate({}, { page, limit }, function (err, result) {
        return result;
    });
    res.render('monhoc/index', { monhocs });
});

router.get('/add', authMiddleware, function(req, res, next) {
    res.render('monhoc/add', {error: null, success: null});
});

router.get('/edit/:id', authMiddleware, async function(req, res, next){
    const monhoc = await Monhoc.findById(req.params.id);
    res.render('monhoc/edit', { monhoc, error: null, success: null });
});

router.post('/add', authMiddleware, async function(req, res, next){
    try {
        let {maMH, tenMH, sotinchi} = req.body;
        const existingMonhoc = await Monhoc.findOne({maMH});
        if (existingMonhoc) {
            return res.render('monhoc/add', {error: "Môn học đã tồn tại", success: null});
        }
        sotinchi = Number(sotinchi);
        const monhoc = new Monhoc({maMH, tenMH, sotinchi});
        await monhoc.save();
        res.render('monhoc/add', {error: null, success: "Thêm thành công"});
    } catch (error) {
        res.render('monhoc/add', {error: error.message, success: null});
    }
})

router.post('/edit/:id', authMiddleware, async function(req, res, next){
    const monhoc = await Monhoc.findById(req.params.id);
    try{
        let {maMH, tenMH, sotinchi} = req.body;
        sotinchi = Number(sotinchi);
        const monhoc = await Monhoc.findByIdAndUpdate(req.params.id, {maMH, tenMH, sotinchi});
        res.redirect(`/monhoc/edit/${req.params.id}`);
    } catch (error) {
        res.render('monhoc/edit', { monhoc, error: error.message, success: null });
    }
})

router.post('/delete/:id', authMiddleware, async function(req, res, next){
    try{
        await Monhoc.findByIdAndDelete(req.params.id);
        res.redirect("/monhoc");
    } catch (error) {
        console.log(error);
    }
})
  
module.exports = router;