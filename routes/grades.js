import express from 'express';
import { promises as fs, read } from 'fs';

const { writeFile, readFile } = fs;
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let grade = req.body;

    const data = JSON.parse(await readFile(global.fileName));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const grade = req.body;

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.grades.findIndex((g) => {
      return g.id === parseInt(grade.id);
    });

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const index = data.grades.findIndex((g) => {
      return g.id === parseInt(req.params.id);
    });

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
});

router.get('/sum/:student/:subject', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const dataFiltered = data.grades.filter((grade) => {
      return (
        grade.student === req.params.student &&
        grade.subject === req.params.subject
      );
    });

    const valueSum = dataFiltered.reduce((acc, crr) => {
      return acc + crr.value;
    }, 0);

    // resposta sempre em Json
    res.send({ valueSum });
  } catch (err) {
    next(err);
  }
});

router.get('/average/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const dataFiltered = data.grades.filter((grade) => {
      return (
        grade.type === req.params.type && grade.subject === req.params.subject
      );
    });

    const valueSum = dataFiltered.reduce((acc, crr) => {
      return acc + crr.value;
    }, 0);

    const valueAverage = valueSum / dataFiltered.length;

    res.send({ valueAverage });
  } catch (err) {
    next(err);
  }
});

router.get('/top3/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    let dataFiltered = data.grades.filter((grade) => {
      return (
        grade.type === req.params.type && grade.subject === req.params.subject
      );
    });

    dataFiltered.sort((a, b) => {
      return b.value - a.value;
    });

    let top3Data = [];
    for (let i = 0; i < 3; i++) {
      top3Data.push({
        id: dataFiltered[i].id,
        student: dataFiltered[i].student,
        subject: dataFiltered[i].subject,
        type: dataFiltered[i].type,
        value: dataFiltered[i].value,
        timestamp: dataFiltered[i].timestamp
      });
    }

    res.send(top3Data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const index = data.grades.findIndex((g) => {
      return g.id === parseInt(req.params.id);
    });

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.grades = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(data.grades);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  res.status(400).send({ error: err.message });
});

export default router;
