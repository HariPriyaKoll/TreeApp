const express = require('express');
const router = express.Router();

var users = [
  { "id":1,"name": "admin","password":"admin"}
 ];

var userHistory=[
  //{"id":1,"visitedNode":null}
]


/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/users', function (req, res) {
  res.send(users);
});

router.get('/getSaveHistory', function (req, res) {
  res.send(userHistory);
});

router.post('/register', function (req, res) {
  console.log("POST: " + req.body.name);
  let id = 1;
  if (users.length > 0) {
      let maximum = Math.max.apply(Math, users.map(function (f) { return f.id; }));
      id = maximum + 1;
  }
  let new_user = {"id": id, "name": req.body.username,"password":req.body.password};
  users.push(new_user);
  res.send(new_user);

});
router.post('/save', function (req, res) {
  console.log("POST save history: " + req.body.name);
  let id = 1;
  if (userHistory.length > 0) {
      let maximum = Math.max.apply(Math, userHistory.map(function (f) { return f.id; }));
      id = maximum + 1;
  }
  let new_visitedNode = {"id": id, "visitedNode":req.body.name,"path":req.body.path};
  userHistory.push(new_visitedNode);
  res.send(new_visitedNode);

});
module.exports = router;