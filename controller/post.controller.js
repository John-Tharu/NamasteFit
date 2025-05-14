import { checkEmail, hashpass, saveData } from "../model/model.js";
import { registerValidate } from "../validation/validation.js";


export const savedata = async (req,res) =>{
    //console.log(req.body);
    const {data,error} = registerValidate.safeParse(req.body);
    if (error) {
        console.log(error);
        req.flash("errors",error.errors[0].message);
        return res.redirect('/register');
    }

    const {name,email,password} = data;
    
    const [checkedEmail] = await checkEmail(email);
    console.log(checkedEmail);

    if(checkedEmail){
        req.flash("errors","Email already exists !!!!");
        return res.redirect('/register');
    } 

    const pass = await hashpass(password);

    const [id ]= await saveData({name,email,pass});
    console.log(id);

    res.redirect('/login');
}