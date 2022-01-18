// const mongoose = require('mongoose');
// const uri = "mongodb+srv://minor:minor%401234@cluster0.qei85.mongodb.net/codenow?retryWrites=true&w=majority";

// try {
//   // Connect to the MongoDB cluster
//   mongoose.connect(
//     uri,
//     { 
//       useNewUrlParser: true,
//        useUnifiedTopology: true 
//     },
//     () => console.log(" Mongoose is connected")
//   );
// } catch (e) {
//   console.log("could not connect");
// }
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb+srv://minor:minor%401234@cluster0.qei85.mongodb.net/codenow?retryWrites=true&w=majority";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("codenow");
//   dbo.createCollection("try", function(err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });
// });
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb+srv://minor:minor%401234@cluster0.qei85.mongodb.net/codenow?retryWrites=true&w=majority";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });
const mongoose =require('mongoose');
mongoose.connect("mongodb+srv://minor:minor%401234@cluster0.qei85.mongodb.net/codenow?retryWrites=true&w=majority")
.then(()=> console.log('connection successfull'))
.catch((err)=>  console.log(err));