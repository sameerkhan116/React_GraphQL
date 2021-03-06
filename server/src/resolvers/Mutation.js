const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

// Getting user id from the context
function post(parent, { url, description }, ctx, info) {
  const userId = getUserId(ctx);
  // pass the data as needed by connecting postedBy with the authenticated user
  return ctx.db.mutation.createLink({
    data: { url, description, postedBy: { connect: { id: userId } } },
    info
  });
}

// signup resolver
async function signup(parent, args, ctx, info) {
  // hash the password using bcrypt lib
  const password = await bcrypt.hash(args.password, 10);
  // create user with the data provided as args.
  const user = await ctx.db.mutation.createUser({
    data: { ...args, password }
  });

  // get the token using jwt
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  // return the token and the newly created user.
  return {
    token,
    user
  };
}

async function login(parent, args, ctx, info) {
  const user = await ctx.db.query.user({ where: { email: args.email } });
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user
  };
}

async function vote(parent, args, ctx, info) {
  const { linkId } = args;
  const userId = getUserId(ctx);
  const linkExists = await ctx.db.exists.Vote({
    user: { id: userId },
    link: { id: linkId }
  });
  if (linkExists) {
    throw new Error(`Already voted for link: ${linkId}`);
  }

  return ctx.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: linkId } }
      }
    },
    info
  );
}

module.exports = {
  post,
  signup,
  login,
  vote
};
