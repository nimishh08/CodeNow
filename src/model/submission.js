const mongoose = require('mongoose');

const submissionScheme = new mongoose.Schema({
    email: {
        type: String,
        require: true,
    },
    submittedCode: {
        type: String,
        require: true,
    },
    status: {
        type: Boolean,
        require: true
    },
    timeOfSubmission: {
        type: String,
        require: true
    },
    score: {
        type: Number,
        require: true
    },
    contestName: {
        type: String,
        require: true
    },
    problem_names: [{
        name: {
            type: String,
            require: true
        }
    }]
});
submissionScheme.methods.addNameOf = async function (name) {
    try {
        this.problem_names = this.problem_names.concat({
            name
        });
        await this.save();
    } catch (err) {
        console.log(err);
    }
}
const submission = new mongoose.model('submission', submissionScheme);
module.exports = submission;