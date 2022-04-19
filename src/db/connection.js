const mongoose =require('mongoose');
mongoose.connect(MongoAtlasURL)
.then(()=> console.log('connection successfull'))
.catch((err)=>  console.log(err));
