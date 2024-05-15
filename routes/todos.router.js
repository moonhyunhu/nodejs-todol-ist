import express from 'express';
import Todo from '../schemas/todo.schema.js';
import joi from 'joi';

const router = express.Router();

//유효성 검사

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

//할일 등록 api         //데이터를 조회하는동안 멈출수 있기 때문에 async사용
router.post('/todos', async (req, res, next) => {
  try {
    //1.클라이언트로 부터 받아온 value데이터를 가져온다
    //const { value } = req.body;

    const vaildation = await createdTodoSchema.validateAsync(req.body);

    const { value } = vaildation;

    //1-1.클라이언트에서 value데이터가 전달되지 않았을 때 클라이언트에게 에러 메세지 전달
    if (!value) {
      return res
        .status(400)
        .json({ errMessage: '해야할 일 (value) 데이터가 존재하지 않습니다.' });
    }

    //2.해당하는 마지막 order 데이터를 조회한다
    //findOne 한개의 데이터만 조회
    //sort매개변수에 문자열 order를 넣으면 오름차순으로 정렬하는데 order앞에 -를 붙이면 내림차순으로 정렬한다
    const todoMaxOrder = await Todo.findOne().sort('-order').exec(); //Todo라는 컬렉션에서 내림차순으로 정렬된 한개의 order값을 찾는다 promise형식으로

    //3.만약 존재한다면 현재 해야할 일을 +1하고 order데이터가 존재하지 않으면 1로 설정
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    //4.해야할 일 등록
    const todo = new Todo({ value, order }); //하나의 value orer가 들어간 객체 데이터 생성
    await todo.save(); //데이터베이스에 저장

    //5.해아할 일을 클라이언트에게 반환한다.
    return res.status(201).json({ todo: todo });
  } catch (error) {
    //Router 다음에 있는 에러처리 미들웨어를 실행한다.
    next(error);
  }
});

router.get('/todos', async (req, res, next) => {
  //1.해아할 일 목록 조회를 진행
  const todos = await Todo.find().sort('-order').exec();

  //2.해야할 일 목록 조회 결과를 클라이언트에 반환
  return res.status(200).json({ todos: todos });
});

//해야할 일 순서 변경 완료 해제   // /:todoId로 해야할 일을 찾고
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;
  //순서를 전달받았고{order}
  //현재 나의 order가 무엇인지 알아야됨
  //해야할 일이 있고 currentTodo
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res(404).json({ errorMessage: '해야할 일이 존재하지 않습니다.' });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order: order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    //현재 순서를 변경하고
    currentTodo.order = order;
  }

  if (done !== undefined) {
    // done값이 true이면 현재 시간을 반환하고 false이면 null을 반환
    // 할 일 완료가 done = true 해제가 done = false이다.
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  //데이터베이스에 저장한다.
  await currentTodo.save();

  return res.status(200).json({});
});

//할 일 삭제
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res.status(404).json({ errMessage: '존재하지않는 할 일 입니다' });
  }

  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({ todoId: '삭제완료' });
});

export default router;
