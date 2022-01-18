const mongoose=require('mongoose');
const contestInfo=new mongoose.Schema({
   description:{
        type:String,
        require:true
    },
    prizes:{
        type:String,
        require:true
    },
    rules:{
        type:String,
        require:true
    }
});
const contestExtraInfo=new mongoose.model('contestExtraInfo',contestInfo);
module.exports=contestExtraInfo;
