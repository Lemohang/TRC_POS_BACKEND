const Counter = require("../models/counter.model");

const getNextSequence = async (name, session = null) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      new: true,
      upsert: true,
      session,
    }
  );

  return counter.sequence;
};

module.exports = {
  getNextSequence,
};