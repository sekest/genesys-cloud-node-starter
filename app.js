import 'dotenv/config';
import express from 'express';
import { getLicenses } from './services/licensesService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Genesys Cloud middleware app is running.');
});

app.get('/licenses', async (req, res) => {
  try {
    const data = await getLicenses();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});