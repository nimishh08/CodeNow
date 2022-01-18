const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');

const usersScheme=new mongoose.Schema({
     name:{
         type:String,
         require:true
     },
     email:{
         type:String,
         require:true,
         unique:true
     },
     password:{
        type:String,
        require:true
     },
     tokens:
     [
         {
             token:
             {
                type:String,
                require:true
             }
         }
     ]
});
usersScheme.methods.generateAuthToken= async function(){
    try{
        const token=jwt.sign({_id:this._id},'ourprojectnameiscodenowwearebuildingaprojetforonlinecoding');
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
        console.log(err);
    }
}
const Register=new mongoose.model('user',usersScheme);
module.exports=Register;