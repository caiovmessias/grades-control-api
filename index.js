import express from 'express';
import { promises as fs } from 'fs';
import gradeRouter from './routes/grades.js';
const { writeFile, readFile } = fs;

global.fileName = 'grades.json';

const app = express();
app.use(express.json());

app.use('/grades', gradeRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    console.log('API Started!');
  } catch (err) {
    console.log(err);
  }
});
