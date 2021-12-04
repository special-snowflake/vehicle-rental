const express = require('express');
const homeRouter = express.Router();

homeRouter.get('/', (_request, response, _next) => {
  response.status(200).send(`<a href='vehicles'>Vehicles</a><br>
    <a href='/popular'>Popular</a><br>
    <a href='/profile'>Profile</a><br>
    <a href='/testimony'>Testimony</a>`);
});

module.exports = homeRouter;
