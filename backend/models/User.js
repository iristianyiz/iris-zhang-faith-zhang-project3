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
    // Never return password hashes from queries unless explicitly selected.
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });

userSchema.virtual("createdGames", {
  ref: "Game",
  localField: "_id",
  foreignField: "creator",
});

function omitSecrets(doc, ret) {
  delete ret.passwordHash;
  return ret;
}

userSchema.set("toJSON", { virtuals: true, transform: omitSecrets });
userSchema.set("toObject", { virtuals: true, transform: omitSecrets });

export const User = mongoose.model("User", userSchema);
