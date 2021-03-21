import {Request, Response} from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { UserRepository } from '../repositories/UsersRepository';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

class UserController {
    async create( req : Request, res : Response) {
        const {name, email} = req.body;

        //validação
        const schema = yup.object().shape({
            name : yup.string().required(),
            email : yup.string().required()
        })

        try {
            await schema.validate(req.body,{abortEarly : false})
        } catch (error) {
            throw new AppError('error')
        }

        const userRepository = getCustomRepository( UserRepository );

        const userAlreadyExists = await userRepository.findOne({
            email
        })
        
        if(userAlreadyExists) {
            throw new AppError('User already exists!')
        }
        const user = userRepository.create({
            name,
            email
        })
        await userRepository.save(user);
        
        await res.status(201).json(user)
    }
}
export { UserController };