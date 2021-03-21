export class AppError {
    public readonly message : string;
    public readonly statusCode : number;

    constructor(messeage : string, statusCode = 400){
        this.message = messeage;
        this.statusCode = statusCode;
    }
}