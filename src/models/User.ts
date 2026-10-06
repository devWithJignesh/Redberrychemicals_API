import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true }
);

// Hash password before saving if modified
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare password method supporting both bcrypt hash & fallback plain-text for existing DB records
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    // If password starts with $2a$ or $2b$, it's a bcrypt hash
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
    // Fallback comparison for legacy plain-text records in MongoDB
    const isMatch = this.password === candidatePassword;
    if (isMatch) {
      // Auto-upgrade plain-text password to bcrypt hash in database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(candidatePassword, salt);
      const UserModel = this.constructor as Model<IUser>;
      await UserModel.updateOne({ _id: this._id }, { $set: { password: hashedPassword } });
    }
    return isMatch;
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema);
