import express from 'express';
import connect from './schemas/index.js';
import todosRouter from './routes/todos.router.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;

connect(); //MongdDB랑 연결하는 함수

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json()); //미들웨어를 사용하게 해주는 코드 맨처음 인자값에 의해서 인자 경로로 접근하는 경우에만 json미들웨어를 거친 뒤 router로 연결되게 함
//express.json 미들웨어? 클라이언트의 요청을 받을때 body에 있는 데이터를 정상적으로 사용할 수 있게 분석해주는 역할
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./assets')); //app.js기준 입력값 경로에 있는 파일을 아무런 가공 없이 그대로 전달해주는 미들웨어 프론트엔드 파일을 서빙

const router = express.Router(); //해당하는 router에 개발한 기능을 연결한 후 별도의 module로 분리 예정

router.get('/', (req, res) => {
  return res.json({ message: 'Hi!' });
});

app.use('/api', [router, todosRouter]);

//에러처리 미들웨어
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
