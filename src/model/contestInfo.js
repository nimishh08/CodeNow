const mongoose=require('mongoose');
const contestRegister=new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    contestName:{
        type:String,
        require:true,
        unique:true
    },
    contestStartDate:{
        type:String,
        require:true
    },
    contestEndDate:{
        type:String,
        require:true
    },
    startingTime:{
        type:String,
        require:true
    },
    endingTime:{
        type:String,
        require:true
    },
    organisationName:{
        type:String,
        require:true
    }
});
const contestDetails=new mongoose.model('contestDetail',contestRegister);
module.exports=contestDetails;
