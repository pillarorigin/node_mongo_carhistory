const express = require('express');
const path = require('path');
const cookieparser = require('cookie-parser'); //쿠키 사용
const session = require('express-session'); //세션 사용
var FileStore = require('session-file-store')(session); //세션 정보를 DB대신 파일에 저장
const hasher = require('pbkdf2-password')(); // 암호화
const morgan = require('morgan'); //클라이언트 요청 때 마다 url console.log 자동으로 찍어줌 
const fs = require('fs');
const flash = require('connect-flash');
var multer = require('multer');
// const router = require('./router/testrouter')(hasher,sampleCarList); //'router'이름의 라우터 모듈 추가
const router = require('./router/testrouter')(multer); //'router'이름의 라우터 모듈 추가
var mongorouter = require('./router/mongorouter')();
var dbconnect = require('./schemas');

const app = express();
const port = 3000;

dbconnect();
//sampleUserList 임시데이터
var sampleUserList = {};
var sampleCarList = [{
    carimage: 'car.jpg',
    carNumber: '11주1111',
    owner: '김씨',
    model: 'SONATA',
    company: 'HYUNDAI',
    numOfAccident: 2,
    numOfOwnerChange: 1
},
{
    carimage: 'car02.jpg',
    carNumber: '22주2222',
    owner: '이씨',
    model: 'MORNING',
    company: 'KIA',
    numOfAccident: 1,
    numOfOwnerChange: 3
},{
    carimage: 'car03.jpg',
    carNumber: '33주3333',
    owner: '박씨',
    model: 'SONATA',
    company: 'HYUNDAI',
    numOfAccident: 2,
    numOfOwnerChange: 1
},
{
    carimage: 'car04.jpg',
    carNumber: '44주4444',
    owner: '홍씨',
    model: 'MORNING',
    company: 'KIA',
    numOfAccident: 1,
    numOfOwnerChange: 3
},{
    carimage: 'car.jpg',
    carNumber: '55주5555',
    owner: '방씨',
    model: 'SONATA',
    company: 'HYUNDAI',
    numOfAccident: 2,
    numOfOwnerChange: 1
},
{
    carimage: 'car02.jpg',
    carNumber: '66주6666',
    owner: '안씨',
    model: 'MORNING',
    company: 'KIA',
    numOfAccident: 1,
    numOfOwnerChange: 3
},{
    carimage: 'car03.jpg',
    carNumber: '77주7777',
    owner: '유씨',
    model: 'SONATA',
    company: 'HYUNDAI',
    numOfAccident: 2,
    numOfOwnerChange: 1
},
{
    carimage: 'car04.jpg',
    carNumber: '88주8888',
    owner: '임씨',
    model: 'MORNING',
    company: 'KIA',
    numOfAccident: 1,
    numOfOwnerChange: 3
},{
    carimage: 'car.jpg',
    carNumber: '99주9999',
    owner: '권씨',
    model: 'SONATA',
    company: 'HYUNDAI',
    numOfAccident: 2,
    numOfOwnerChange: 1
},
{
    carimage: 'car.jpg',
    carNumber: '00주0000',
    owner: '연씨',
    model: 'MORNING',
    company: 'KIA',
    numOfAccident: 1,
    numOfOwnerChange: 3
}];

//fs사용법 (07.10)
//console.log(JSON.stringify(sampleUserList));
//fs.writeFileSync('data/userlist.json', JSON.stringify(sampleUserList, null, 2));

//sampleUserList 내용 지우고
if(fs.existsSync('data/userlist.json')){
    let rawdata = fs.readFileSync('data/userlist.json'); //1단계 .담아놓고
    sampleUserList = JSON.parse(rawdata); //2단계. parse 함수 이용 데이터 sampleUserList에 담기
}


//html 랜더링 설정
app.set('views', path.join(__dirname, 'views')); //변수 설정
app.set('view engine', 'ejs'); //변수 설정
app.engine('html', require('ejs').renderFile); //엔진 설정
app.use(morgan('dev')); //consol.log 설정
app.use(express.urlencoded({
    extended: false
}));

//json 파일 형식을 받기 위한 설정 코드
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
//07.15파일 업로드 관련 미들웨어 추가 (uploads 폴더를 static으로 개방(/files에 매핑))
app.use('/files', express.static(path.join(__dirname, 'uploads')));
app.use(cookieparser()); //미들웨어
app.use(session({
    key: 'sid', //세션 키
    secret: 'secret', //비밀 키
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));
app.use(flash());
app.use('/mongo', mongorouter);


//07.10 로그인 세션 유지
app.use(function(req,res,next){
    // console.log(req.session.userinfo);
        res.locals.userinfo = req.session.userinfo;
        //undefined와  not defined차이
        let a = {};
        // console.log("변수 a의 타입:", typeof a); 
        // console.log("변수 a의 값이:", a);
        // console.log(res.locals.userinfo);
    next();
});

app.use('/test', router); //test폴더 안 , 'router'이름의 라우터를 찾아.

//1. index.html 
app.get('/', (req, res) => {
    if (req.session.userinfo) {
        res.render('index.html');
        console.log("session 정보는 req.session에 있어")
    } else {
        res.render('index.html');
        console.log(res.locals.userinfo)  
    }
});

//2. login 코드
app.get('/logininfo', (req, res) => {
    res.render('carlist.html', { logincookie: req.cookies });
});

//2-1. login 인증 코드
app.post('/login', (req, res) => {
    console.log("/login을 요청받았습니다");
    let userid = req.body.userid;
    let password = req.body.password;
    let user = sampleUserList[userid];
        if (user) {
            hasher({
                password: password,
                salt: user.salt
            }, function (err, pass, salt, hash) {
                if (err) {
                    console.log('ERR:', err);
                    res.redirect('login_form')
                }
                if (hash === user.password) {
                    console.log('INFO:', userid, '로그인 성공')
                    req.session.userinfo = sampleUserList[userid];
                    console.log(req.session.userinfo);
                    req.session.save(function () {
                        res.redirect('/');
                    })
                    return;
                } else {
                    console.log('패스워드 오류');
                    req.flash('fmsg', '오류가 발생');
                    res.redirect('/login_form');
                }
            })
        }
});

//logout 기능
//(비회원 정보가 있을 수 있으므로 세션 정보 자체를 다 destroy 하지 않고)
app.get('/logout', (req, res) => {
    //1. session 자체를 날려라
    if (req.session.userinfo) {
        console.log('로그아웃');
        res.clearCookie('sid');
        req.session.destroy(
            function (err) {
                if (err) {
                    console.log('세션 삭제 에러 남');
                } else {
                    console.log('세션 삭제 성공')
                }
                res.redirect('/')
            }
        )
    } else {
        console.log('로그인 안되어 있음');
        res.redirect('/');
    }
});
//2. user만 날려라
// if(req.session.userinfo){
//     delete req.session.userinfo;
// }

app.get('/redirect2', (req, res) => {
    console.log("/redirect2를 요청받았습니다.");
    res.render("carlist.html");
});

app.get('/login_form', (req, res) => {
    console.log("/login_form을 요청받았습니다.");
    res.render('login_form.html', {
        fmsg: req.flash('fmsg') 
    })
});

//3. signin_form.html(회원가입 폼) 보여줄 코드
app.get('/signup_form', (req, res) => {
    console.log("/signup_form을 요청받았습니다.");
    res.render('signup_form.html');
});

//3-1. sign up 될 때 코드
app.post('/signup', (req, res) => {
    console.log("/signup을 요청받았습니다.");
    //회원가입
    let username = req.body.username;
    let userid = req.body.userid;
    let password = req.body.password;
    let email = req.body.email;
    let tel = req.body.tel;
    let address = req.body.address;
    let user = sampleUserList[userid];
        hasher({
            password: req.body.password
        }, (err, pass, salt, hash) => {
            if (err) {
                console.log('err:', err);
                res.redirect('/signup_form');
            }
            else {
                let user = {
                    username: username,
                    userid: userid,
                    password: hash,
                    salt: salt,
                    email: email,
                    tel: tel,
                    address: address
                }
                //07.10 추가
                sampleUserList[userid] = user;
                fs.writeFileSync('data/userlist.json', JSON.stringify(sampleUserList, null, 2));
                console.log('user added:', user);
                res.redirect('/login_form');
            }
        });
        //res.render('login_form.html');
});


//9. 서버에 회원 정보를 저장한 객체 배열을 생성하고 회원 리스트를 보여주는 /user_list 화면을 구현
app.get('/api/userlist', (req, res) => {
    res.json(sampleUserList);
});

//10. userlist.html
app.get('/user_list', (req, res) => {
    res.render('userlist.html');
});


//4. regcar_form.html(자동차 등록 폼) 보여줄 코드
app.get('/regcar_form', (req, res) => {
    console.log(req.body);
    if(req.session.userinfo){
        res.render('regcar_form.html', {list:sampleCarList,
        user : req.session.userinfo}); 
    } else {
        res.redirect('/login_form');
    }
    //res.send(JSON.stringify(sampleCarList));
});
//4-1. regcar 자동차 등록될 때 코드
app.post('/api/regcar', (req, res) => {
    console.log(req.body);
    sampleCarList.push(req.body);
    console.log(sampleCarList);
    res.json(sampleCarList); //성공시 carlist 보여주기
});

//(07.10 로그인된 사용자만 보여줄 페이지 분리)
//5. carlist.html 
app.get('/car_list', (req, res) => { 
    if (req.session.userinfo) {
        res.render('carlist.html', {
            list: sampleCarList,
            user: req.session.userinfo
        });
    } else {
        //res.send('<script>alert " 로그인이 필요한 서비스 입니다. " </script>');
        res.redirect('/login_form');
    }
});

//8. ajax (carlist)
app.get('/api/carlist', (req, res) => {
    res.json(sampleCarList); //.json()안에 객체를 주면 제이슨 형식으로 데이터를 보내줌
});

//6. carinfo.html
app.get('/car_info', (req, res) => {
    res.render('carinfo.html');
});

//7. carhistory.html
app.get('/car_history', (req, res) => {
    res.render('carhistory.html');
});

//07.05 ejs(서버사이드 자바스크립트) 실습 
app.get('/ejs', (req, res) => {
    console.log(req.body);
    res.render('ejs.html', { carlist: sampleCarList })
});
//07.05 include 실습(inc dir / footer.ejs, header.ejs)
app.get('/main', (req, res) => {
    res.render('main.html')
});

//07.11 search 기능 구현 (차량 번호)
app.post('/api/search', (req, res)=> {
    console.log(req.body);
    // let carNum = req.body.searchText;
    let data = req.body.searchKind;
    let data_name = req.body.searchText;
    let box ={};

    for(let i=0; i < sampleCarList.length; i++){
        if(sampleCarList[i][data] == data_name){
            box[sampleCarList[i].carNumber] = sampleCarList[i];
        } 
    };
    console.log(box);
    res.json(box);
    // let found = sampleCarList.find(function(element){
    //     //뭘 find 할지 코드 쓸 자리
    //     console.log('element = ', element);
    //     if(element.carNumber === carNum){
    //         console.log('found');
    //         return element;
    //     }
    // });
    // console.log('found = ', found);
    // res.json(found);
});


//07.11 search 기능 구현 (제조사)
// app.post('/api/filter', (req, res)=> {
//     console.log(req.body);
//     console.log(req.body.searchText);

//     let company = req.body.searchText;
//     //let carNum = '22주2222';
//     let found = sampleCarList.filter(function(element){
//         console.log('element = ', element);
//         if(element.company === company){
//             console.log('found');
//             return element;
//         }
//     });
//     console.log('found = ', found);
//     res.json(found);
// });


app.listen(port, () => {
    console.log('Server listening... ' + port);
});