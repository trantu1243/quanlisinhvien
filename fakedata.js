const Lop = require("./models/lop");
const Sinhvien = require("./models/sinhvien");
const Diem = require("./models/diem");
const Monhoc = require("./models/monhoc");
const { faker } = require('@faker-js/faker');

async function generateSinhvienData() {
    try {
//        await Sinhvien.deleteMany({}); // Clear existing data
        const students = [];
  
        const malop = "DT4B";
        const lop = await Lop.findOne({malop});
        await Sinhvien.deleteMany({ lopid: lop._id });
        for (let i = 0; i < 50; i++) {
            const student = new Sinhvien({
              maSV: "DT4" + faker.number.int({ min: 30000, max: 50000 }),
              tenSV: faker.person.fullName(),
              gioitinh: faker.helpers.arrayElement(['nam', 'nữ']),
              ngaysinh: faker.date.between({ from: '2001-01-01', to: '2005-01-01' }),
              lopid: lop._id,
              quequan: faker.location.city()
            }); 
            students.push(student); 
        } 
        await Sinhvien.insertMany(students); 
        console.log('Fake data inserted successfully!');
    } catch (err) {
        console.error('Error inserting fake data:', err);
    } finally {
        mongoose.connection.close();
    }
  }

  async function generateDiemData() {
    try { 
        await Diem.deleteMany({}); // Clear existing data
        const diems = [];
        const sinhviens = await Sinhvien.find();
        const monhocs = await Monhoc.find();
        console.log(sinhviens.length);
        for (let i=0; i<sinhviens.length; i++)
            for (let j=0; j<monhocs.length; j++){
                const TP1 = faker.number.float({ multipleOf: 0.1, min: 0, max:10 });
                const TP2 = faker.number.float({ multipleOf: 0.1, min: 0, max:10 });
                const THI = faker.number.float({ multipleOf: 0.1, min: 0, max:10 });
                let KTHP = (TP1*0.7 + TP2*0.3)*0.3 + THI*0.7;
                KTHP = parseFloat(KTHP.toFixed(1));
                const DANHGIA = (KTHP >= 4 && (TP1*0.7 + TP2*0.3) >= 4 && THI >= 4);
                const diem = new Diem({
                    SVid: sinhviens[i]._id,
                    MHid: monhocs[j]._id,
                    tp1: TP1,
                    tp2: TP2,
                    thi: THI,
                    kthp: KTHP,
                    danhgia: DANHGIA
                });
                await diem.save();
                diems.push(diem);
            }
        
        

        console.log('Fake data inserted successfully!');
    } catch (err) {
        console.error('Error inserting fake data:', err);
    } 
  }

  module.exports = { generateSinhvienData, generateDiemData }