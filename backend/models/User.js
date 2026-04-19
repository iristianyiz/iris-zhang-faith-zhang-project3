import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 32,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });

userSchema.virtual("createdGames", {
  ref: "Game",
  localField: "_id",
  foreignField: "creator",
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const User = mongoose.model("User", userSchema);
