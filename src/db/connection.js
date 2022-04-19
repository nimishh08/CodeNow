const mongoose =require('mongoose');
mongoose.connect("mongodb+srv://minor:minor%401234@cluster0.qei85.mongodb.net/codenow?retryWrites=true&w=majority")
.then(()=> console.log('connection successfull'))
.catch((err)=>  console.log(err));
