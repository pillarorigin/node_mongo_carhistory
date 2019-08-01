//mongodb 연결
const mongoose = require('mongoose');

module.exports = () => {
    //mongodb 연결
    mongoose.connect('mongodb://localhost/carlist', {
        useNewUrlParser: true
    }, (err) => {
        if (err) {
            console.log('mongodb 연결 오류..');
        } else {
            console.log('mongodb 연결 성공..');
        }
    });

    mongoose.connection.on('error', (error) => {
        console.log('mongodb 연결 에러..');
    });
    mongoose.connection.on('disconnected', () => {
        console.log('mongodb 연결 끊어짐');
    });

}