import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema(
  {
    avatarUrl: { type: String },
    nickname: { type: String, required: true },
    real_name: { type: String, required: true },
    origin_description: { type: String, required: true },
    superpowers: { type: String, required: true },
    catch_phrase: { type: String, required: true },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Character = mongoose.model('Character', characterSchema);

export default Character;
