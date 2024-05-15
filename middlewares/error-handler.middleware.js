export default (err, req, res, next) => {
  console.error('에러처리 미들웨어가 실행됐다.');
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errorMessage: err.message });
  }

  return res.status(500).json({ errorMessage: '서버에서 에러 발생' });
};
