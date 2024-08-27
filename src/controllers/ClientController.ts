import {Request, Response} from 'express';
import {Client} from '../entity/Client';
import {AppDataSource} from '../data-source';
import { csvToObj } from '../utils/csv-to-obj';
import { Operator } from '../entity/Operator';
import { Not, In } from 'typeorm';

export default class ClientController{
    public async save_from_csv(req: Request, res: Response){
        const files = req.files as unknown as Express.Multer.File[];
        if(!files) return res.status(400).json({error: 'No file found'});
        
        let clientList;
        try {
            clientList = this.parseClientFiles(files);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }

        clientList = this.formatClients(clientList);
        clientList = await this.mapOperatorsToClients(clientList);

        const clientRepo = AppDataSource.getRepository(Client);
        try {
            const clients = clientRepo.create(clientList);
            await clientRepo.save(clients);
            return res.status(201).json(clients);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }

    public async redistributeClientsToOperators(req: Request, res: Response){
        const clientsRepo = AppDataSource.getRepository(Client);
        let clients = await clientsRepo.find();
        clients = await this.mapOperatorsToClients(clients);
        
        try {
            await clientsRepo.save(clients);
            return res.status(200).json(clients);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }

    public async listByOperator(req: Request, res: Response){
        let operatorId = req.params.id as unknown as number;
        if(!operatorId) return res.status(400).json({error: 'No operator id found'});
        res.status(200).json(await AppDataSource.getRepository(Client).find({where: {operator_id: operatorId}}));
    }

    public async exportData(req: Request, res: Response){
        const clients = await AppDataSource.createQueryBuilder()
        .from(Client, 'client')
        .select([
            'client.name as Nome',
            'client.birthdate as Nascimento',
            'client.value as Valor',
            'client.email as Email',
            'operator.name as Operador'
        ])
        .leftJoin('operator', 'operator', 'operator.id = client.operator_id')
        .orderBy('operator.name')
        .getRawMany();
        res.status(200).json(clients)
    }

    private parseClientFiles(files: Express.Multer.File[]){
        let clientList = [];
        for(const file of files){ 
            if(file.mimetype !== 'text/csv') throw new Error('Invalid file type');
            const clients = csvToObj(file.buffer.toString(), ',');
            clientList.push(...clients);
        }
        return clientList;
    }

    private formatClients(clients: any[]){
        return clients.map((client: any) => {
            if(!client['nome'] || !client['nascimento'] || !client['valor'] || !client['email']) return null; // In case of missing fields, the client will not be added
            const dateParts = client['nascimento'].split('/');
            const date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) -1, parseInt(dateParts[0]), -3, 0, 0, 0); // Formatting date to UTC
            return {
                name: client['nome'],
                birthdate: date,
                value: parseFloat(client['valor']),
                email: client['email'],
            }
        });
    }

    public async mapOperatorsToClients(clients: any[], excludeOperators: number[] = []){
        let operators = await AppDataSource.getRepository(Operator).find({ select: ['id'], 
            where: {id: Not(In(excludeOperators))} 
        });
        if(operators.length === 0) return clients;
        operators = operators.map((operator: any) => operator.id);
        let operatorIndex = 0;
        return clients.map((client: any) => {
            client.operator_id = operators[operatorIndex];
            operatorIndex = (operatorIndex + 1) % operators.length;
            return client;
        });
    }
}