const jwt = require('jsonwebtoken');
const APP_SECRET = 'GraphQL-is-aw3some';

function getUserId(context) {
  // check if authorization is available in the request
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    // if it is, get the token by replacing the bearer suffix that we have set
    const token = Authorization.replace('Bearer ', '');
    // veryify userId using jwt and return it.
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }

  throw new Error('Not authenticated');
}

module.exports = {
  APP_SECRET,
  getUserId
};
