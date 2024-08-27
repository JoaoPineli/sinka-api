import { Operator } from "../entity/Operator";
import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import ClientController from "./ClientController";
import { Client } from "../entity/Client";

export default class OperatorController{
    public async save(req: Request, res: Response){
        const {name} = req.body;
        const operatorRepo = AppDataSource.getRepository(Operator);
        try {
            const operator = operatorRepo.create({name});
            await operatorRepo.save(operator);
            return res.status(201).json(operator);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }
    public async list(req: Request, res: Response){
        try {
            const operators = await AppDataSource.createQueryBuilder()
                .from(Operator, 'operator')
                .select([
                    'operator.id as id',
                    'operator.name as name',
                    'COUNT(CASE WHEN client.operator_id = operator.id THEN 1 END) as clients_count'
                ])
                .leftJoin('client', 'client', 'client.operator_id = operator.id')
                .groupBy('operator.id')
                .orderBy('operator.id')
                .getRawMany();
            return res.status(200).json(operators);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }

    public async exportData(req: Request, res: Response){
        const operators = await AppDataSource.getRepository(Operator).find(
            {relations: ['clients']}
        );
        return res.status(200).json(operators);
    }

    public async update(req: Request, res: Response){
        const {id} = req.params;
        const {name} = req.body;
        const operatorRepo = AppDataSource.getRepository(Operator);
        try {
            const operator = await operatorRepo.findOne({
                where: {id: parseInt(id)}
            });
            if(!operator){
                return res.status(404).json({error: 'Operator not found'});
            }
            operator.name = name;
            await operatorRepo.save(operator);
            return res.status(200).json(operator);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }

    public async delete(req: Request, res: Response){
        const {id} = req.params;
        const operatorRepo = AppDataSource.getRepository(Operator);
        const operator = await operatorRepo.findOne({
            where: {id: parseInt(id)},
            relations: ['clients']
        });
        if(!operator){
            return res.status(404).json({error: 'Operator not found'});
        }
        try {
            const clientController = new ClientController();
            const updatedClients = await clientController.mapOperatorsToClients(operator.clients, [operator.id]);
            await AppDataSource.getRepository(Client).save(updatedClients);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
        try {
            await operatorRepo.remove(operator);
            return res.status(200).json({message: 'Operator deleted'});
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }
}