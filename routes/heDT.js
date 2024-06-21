const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const HeDT = require('../models/heDT');

router.get('/', authMiddleware, async function(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const heDTs = await HeDT.paginate({}, { page, limit }, function (err, result) {
        return result;
    });
    res.render('heDT/index', { heDTs });
});

router.get('/add', authMiddleware, function(req, res, next) {
    res.render('heDT/add', {error: null, success: null});
});

router.get('/edit/:id', authMiddleware, async function(req, res, next){
    const heDT = await HeDT.findById(req.params.id);
    res.render('heDT/edit', { heDT, error: null, success: null });
});

router.post('/add', authMiddleware, async function(req, res, next){
    try {
        const { maheDT, tenheDT } = req.body;
        const existingheDT = await HeDT.findOne({maheDT});
        if (existingheDT) {
            return res.render('heDT/add', {error: "Hệ ĐT đã tồn tại", success: null});
        }

        const heDT = new HeDT({ maheDT, tenheDT });
        await heDT.save();
        res.render('heDT/add', {error: null, success: "Thêm thành công"});
    } catch (error) {
        res.render('heDT/add', {error: error.message, success: null});
    }
})

router.post('/edit/:id', authMiddleware, async function(req, res, next){
    const heDT = await HeDT.findById(req.params.id);
    try{
        const { maheDT, tenheDT } = req.body;
        const heDT = await HeDT.findByIdAndUpdate(req.params.id, { maheDT, tenheDT });
        res.redirect(`/heDT/edit/${req.params.id}`);
    } catch (error) {
        res.render('heDT/edit', { heDT, error: error.message, success: null });
    }
})

router.post('/delete/:id', authMiddleware, async function(req, res, next){
    try{
        await HeDT.findByIdAndDelete(req.params.id);
        res.redirect("/heDT");
    } catch (error) {
        console.log(error);
    }
})
  
module.exports = router;