const jwt=require('jsonwebtoken');

const checklogin=async (req,res,next) => {
    try {
        const token=req.cookies.jwt;
        if(!token)
        {
            return res.status(200).render('home');
        }
        else{
            next();
        }
    } catch (error) {
        res.status(401).send(error);
    }
}
module.exports=checklogin;