const PostSchema = new mongoose.Schema({
    authorId: mongoose.Schema.Types.ObjectId,
    content: String,
    createdAt: {type: Date, default: Date.now},
    likes: Number,
});