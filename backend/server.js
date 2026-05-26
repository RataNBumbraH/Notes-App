import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './model/user.js';
import Note from './model/notes.js';
import {auth}  from './middleware/middleware.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/notesdb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected With Auth!'))
  .catch(err => console.log(err));

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, username });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Notes Routes ---
app.get('/api/notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notes', auth, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({ userId: req.user.userId, title, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/notes/:id', auth, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deletedNote) return res.status(404).json({ message: 'Note not found or unauthorized' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));