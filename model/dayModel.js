const mongoose = require('mongoose');
const User = require('./userModel');

const daySchema = new mongoose.Schema({
  status: {
    type: Boolean,
    default: false,
    required: [true, 'Justify bottle delivered or not'],
  },
  deliveredAt: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Daily status must belong to user'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

daySchema.index({ deliveredAt: 1, user: 1 }, { unique: true });

daySchema.statics.calcDeliveryStatus = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { user: userId, status: true },
    },
    {
      $group: {
        _id: '$user',
        success: { $sum: 1 },
      },
    },
  ]);

  console.log(stats);

  await User.findByIdAndUpdate(userId, {
    successDelivery: stats[0].success,
  });
};

daySchema.post('save', async function () {
  await this.constructor.calcDeliveryStatus(this.user);
});

const Day = mongoose.model('Day', daySchema);

module.exports = Day;
