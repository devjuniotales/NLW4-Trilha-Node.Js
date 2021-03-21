import { Request, Response } from "express";
import { getCustomRepository , Not , IsNull} from "typeorm";
import { SurveysUserRepository } from "../repositories/SurveysUserRepository";

class NpsController {
    async execute (req : Request, res : Response){
        const { survey_id } =req.params;

        const surveysUsersRepository = getCustomRepository(SurveysUserRepository);

        const surveyUser = await surveysUsersRepository.find({
            survey_id,
            value : Not(IsNull())
        })
        const detractor = surveyUser.filter(
            (survey) => survey.value >= 0 && survey.value <= 6
        ).length;
        const promotors = surveyUser.filter(
            (survey) => survey.value >= 9 && survey.value <= 10
        ).length;
        const passivo = surveyUser.filter(
            (survey) => survey.value >= 7 && survey.value <= 8
        ).length;
        const totalAnsewers = surveyUser.length;

        const calculate = Number(
            (((promotors - detractor) / totalAnsewers) * 100).toFixed(2)
        );

        return res.json({
            detractor,
            promotors,
            passivo,
            totalAnsewers,
            nps : calculate
        })

    }
}
export {NpsController}