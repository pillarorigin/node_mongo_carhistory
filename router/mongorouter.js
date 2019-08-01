var express = require('express');
const hasher = require('pbkdf2-password')();
const Users = require('../schemas/user');


module.exports = function () {
   var router = express.Router();

   router.get('/', (req, res) => {
       res.send('mongodb router');
   })
   return router;
}
