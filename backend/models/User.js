import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'investigator'], required: true },
    displayName: { type: String, default: '' },
  },
  { timestamps: true, collection: 'users' }
);

export default mongoose.model('User', UserSchema);
