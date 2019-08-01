var express = require('express');
var path = require('path');
module.exports = function (multer) {

    var router = express.Router();
    // @ multer 커스터마이징
    // 저장될 위치
    // 파일명
    // 파일 개수, 용량 제한

    var storage = multer.diskStorage({
        // 서버에 저장할 폴더
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        // 서버에 저장할 파일명
        filename: function (req, file, cb) {
            file.uploadfilename = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
            cb(null, new Date().valueOf() + '_' + file.originalname);
        }
    });

// 07.15 file type filtering (파일 업로드 시 특정 확장자만 가능하도록)
    var imgFileFilter = function(req, file, callback){
        var ext = path.extname(file.originalname); //파일의 확장자 추출 가능.
        console.log('확장자:', ext);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg'){
            return callback(new Error('Only images are allowed'))
            }
        callback(null, true); //null은 정상. true면 계속 진행해?
    };

    var upload = multer({
        storage: storage,
        limits: {
            files: 10,
            fileSize: 3 * 1024 * 1024
        }
    });

    var imgUpload = multer({
        storage: storage,
        fileFilter: imgFileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    });

    router.get('/fileupload_form', (req, res) => {
        console.log('test!!!');
        res.render('test/fileupload.html');
    });

    router.post('/fileupload', imgUpload.single('avatar'), (req, res, next) => {
        console.log(req.file);
        var imgsrc = path.join('/files', req.file.filename);
        console.log('imgsrc =', imgsrc);
        res.render('test/showimage.html', {imagesrc: imgsrc})
        //res.send('uploaded...' + req.file.filename);
    });

    //멀티 파일 업로드
    router.get('/fileupload_multi_form', (req, res) => {
        res.render('test/fileupload_multi.html');
    });

    //미들웨어 가운데 넣을 수 있음. upload.array('photos', 5) 먼저 실행되고 뒤에 코드 실행.
    router.post('/fileupload_multi', upload.array('photos', 5), (req, res, next) => {
        res.send('uploaded...' + req.files[0].filename);
    });

    return router;
}
// module.exports = function(hasher,var1){
//     router.post('/fileupload_multi', upload.array('photos', 5), (req, res, next) => {
//         res.send('uploaded...' + req.files[0].filename);
//     });
//     return router;
// }