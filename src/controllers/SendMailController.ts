import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUserRepository } from "../repositories/SurveysUserRepository";
import { UserRepository } from "../repositories/UsersRepository";
import SendMailServices from "../services/SendMailServices";
import {resolve} from 'path'
import { AppError } from "../errors/AppError";

class SendMailController {

    async execute(req : Request, res : Response){
        const {email , survey_id} = req.body;

        const usersRepository = getCustomRepository(UserRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUserRepository);
    
    
        const user = await usersRepository.findOne({email})

        if(!user){
            throw new AppError('User does not exists')
        }

        const survey = await surveysRepository.findOne({id : survey_id});
        
        if(!survey){
            throw new AppError('Survey does not exists!')
        }
        const npsPath = resolve(__dirname, ".." ,"views" , "emails" , "npsMail.hbs")
      
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where : {user_id : user.id, value : null},
            relations : ['user' , 'survey']
        })

        const variables = {
            name : user.name,
            title : survey.title,
            description : survey.description,
            id : "",
            link : process.env.URL_MAIL
        }   

        if(surveyUserAlreadyExists){
            variables.id = surveyUserAlreadyExists.id;
            await SendMailServices.execute(email,survey.title, variables, npsPath)
            return res.json(surveyUserAlreadyExists)
        }
        // Salvar as informações na tabela surveryUser
        const surveyUser = surveysUsersRepository.create({
            user_id : user.id,
            survey_id
        });

        await surveysUsersRepository.save(surveyUser);
        // enviar e-mail para  o usúario
        variables.id = surveyUser.id;

        await SendMailServices.execute(email, survey.title,variables, npsPath);

        return res.json(surveyUser)
    }
}

export { SendMailController};