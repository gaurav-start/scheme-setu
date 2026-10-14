import 'dotenv/config';
import app from './app.js';
import connectDB from './config/connectDB.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
