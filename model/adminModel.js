const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const slugify = require('slugify');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An user must have a name'],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'An user must have a email'],
      validate: [validator.isEmail, 'Enter valid email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, 'An user must have a mobile number'],
      trim: true,
      unique: true,
      validate: {
        validator: function (val) {
          return val.length === 10;
        },
        message: 'Enter valid mobile number',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    address: {
      type: String,
      required: [true, 'An user must have a address'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'An user must enter password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'please confirm your password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password confirm is not same as password',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    role: {
      type: String,
      default: 'admin',
    },
    slug: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

adminSchema.methods.checkPassword = async function (
  recievedPassword,
  savedPassword
) {
  return await bcrypt.compare(recievedPassword, savedPassword);
};

adminSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < timeStamp;
  }
  return false;
};

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

adminSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { trim: true });
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
