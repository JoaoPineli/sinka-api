import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import "reflect-metadata"
import { AppDataSource } from "./data-source"
import OperatorController from './controllers/OperatorController';
import ClientController from './controllers/ClientController';
import multer from 'multer';

AppDataSource.initialize().then(async () => {  
  const storage = multer.memoryStorage();
  const upload = multer({storage: storage});

  const app = express();
  app.use((cors()));
  app.use(express.json());
  const port = 230;
  
  const operatorController = new OperatorController();
  const clientController = new ClientController();
  app.get('/', (req, res) => {
    res.send('Hello World');
  });
  
  app.get('/operators', (req, res) => {
    operatorController.list(req, res);
  })

  app.post('/operator' , (req, res) => {
    operatorController.save(req, res);
  })

  app.put('/operator/:id', (req, res) => {
    operatorController.update(req, res);
  })

  app.delete('/operator/:id', (req, res) => {
    operatorController.delete(req, res);
  })

  app.get('/clients/getByOperator/:id', (req, res) => {
    clientController.listByOperator(req, res);
  })

  app.get('/clients/export', (req, res) => {
    clientController.exportData(req, res);
  })

  app.post('/clients/csv', upload.array('files'), (req, res) => {
    clientController.save_from_csv(req, res);
  })

  app.post('/clients/redistribute', (req, res) => {
    clientController.redistributeClientsToOperators(req, res);
  })
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(error => console.log(error))

