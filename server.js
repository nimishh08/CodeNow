const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const sh = require('child_process');
const performance = require('perf_hooks').performance;
require('./src/db/connection');
const Register = require('./src/model/register');
const contestDetails = require('./src/model/contestInfo');
// const contestExtraInfo = require('./src/model/contestExtraInfo');
const submission = require('./src/model/submission');
const app = express();
const addProblem = require('./src/model/addProb');
const cookieParser = require('cookie-parser');
const auth = require('./src/middleware/auth');
const checklogin = require('./src/middleware/checklogin');
const static_path = path.join(__dirname, "/public");
app.set('view engine', 'hbs');
app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({
    extended: false
}));
app.get('/', async (req, res) => {
    if (req.cookies.jwt) {
        const contestname = await contestDetails.find();
        return res.render('contests', {
            contestnames: contestname
        });
    }
    res.render('home');
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.get('/contactus', checklogin, (req, res) => {
    res.render('contactus');
});
app.get('/contests', checklogin, async (req, res) => {
    try {
        const contestname = await contestDetails.find();
        res.render('contests', {
            contestnames: contestname
        });
    } catch (error) {
        res.render('contests');
    }
});
app.get('/contests/editcontest/:contestname', checklogin, async (req, res) => {
    try {
        console.log(req.params);
        const problem = await addProblem.find({
            contestName: req.params.contestname
        });

        res.render('edit_problem', {
            pro: problem
        });
    } catch (err) {
        console.log('hello');
        console.log(err);
    }
});
app.get('/contests/editcontest/editproblem/:probname', checklogin, async (req, res) => {
    try {
        const prob = await addProblem.findOne({
            problemName: req.params.probname
        });
        console.log(prob);
        res.render('editchallenge', {
            contestName: prob.contestName,
            problem_name: prob.problemName,
            problem_statement: prob.problem_statement,
            input_format: prob.input_format,
            output_format: prob.output_format,
            constraints: prob.constraints,
            sample_input: prob.sample_input,
            sample_output: prob.sample_output,
            explaination: prob.explanation,
            testcase1: prob.testcase1,
            testcase2: prob.testcase2,
            testcase3: prob.testcase3,
            testcase4: prob.testcase4,
            testcaseo1: prob.testcaseo1,
            testcaseo2: prob.testcaseo2,
            testcaseo3: prob.testcaseo3,
            testcaseo4: prob.testcaseo4,
            score: prob.score
        });
    } catch (err) {
        console.log(err);
    }
});
app.post('/ranking', async (req, res) => {
    try {
        // const ans = await submission.find({
        //     contestName: req.body.contestName
        // }).
        // sort([[{
        //     score: -1
        // }]]).
        // exec(function (err, docs) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(docs);
        //     }
        // });
        console.log(req.body.contestName);
        submission.find({
            contestName: req.body.contestName
        }).sort([
            ['score', -1]
        ]).exec(function (err, docs) {
            console.log(docs);
            res.render('ranking', {
                ans: docs
            });
        });
        // console.log(ans);
    } catch (err) {
        console.log(err);
    }
})
app.get('/contests/:contestname/:problemname', checklogin, async (req, res) => {
    console.log(req.params);
    try {
        const problems = await addProblem.find({
            problemName: req.params.problemname
        });
        console.log(problems[0]);
        res.render('ide', {
            problem_name: problems[0].problemName,
            problem_statement: problems[0].problem_statement,
            input_format: problems[0].input_format,
            output_format: problems[0].output_format,
            constraints: problems[0].constraints,
            sample_input: problems[0].sample_input,
            sample_output: problems[0].sample_output,
            explanation: problems[0].explanation
        });

    } catch (error) {
        console.log(error);
    }

});
app.get('/contests/:contestname', checklogin, async (req, res) => {

    try {
        console.log(req.params);
        const problems = await addProblem.find({
            contestName: req.params.contestname
        });
        console.log(problems);
        res.render('problem_shown', {
            giveornot:false,
            problem: problems,
            contestName: req.params.contestname
        });

    } catch (error) {
        console.log(error);
    }

});
app.get('/login', (req, res) => {
    res.render('login.hbs');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/register', async (req, res) => {
    try {
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const cpassword = req.body.cpassword;
        if (req.body.name === '' || req.body.email === '' || password === '') {
            res.send('Fields should not empty.');
        } else {
            if (password === cpassword) {
                const registerUser = new Register({
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPassword
                });
                const token = await registerUser.generateAuthToken();
                const registered = await registerUser.save();
                res.render('home');
            } else {
                res.send('password are not matched');
            }
        }

    } catch (err) {
        res.status(400).send(err);
    }
});
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email,
            password = req.body.password;
        const userDetail = await Register.findOne({
            email: email
        });
        const matched = await bcrypt.compare(req.body.password, userDetail.password);
        if (matched) {
            const token = await userDetail.generateAuthToken();
            res.cookie('jwt', token, {
                expires: new Date(Date.now() + 604800000),
                httpOnly: true
            });
            res.render('landingpage', {
                email: req.body.email
            });
        } else {
            res.send('Invalid credentials');
        }
    } catch (error) {
        res.send(error);
    }
});
app.all('/logout', auth, async (req, res) => {
    req.user.tokens = await req.user.tokens.filter((currToken) => {
        return req.token !== currToken.token;
    });
    await res.clearCookie('jwt');
    await req.user.save();
    res.render('home');
});
app.post('/contest_administration', checklogin, async (req, res) => {
    try {
        const contest = await contestDetails.find({
            email: req.body.email
        }, {
            _id: 0,
            __v: 0
        });
        res.render('contest_administration', {
            email: req.body.email,
            contests: contest
        });
    } catch (error) {
        res.render('contest_administration', {
            email: req.body.email
        });
    }

});
app.post('/contestform', checklogin, (req, res) => {
    res.render('contestform', {
        email: req.body.email
    });
});
app.post('/contestRegistration', checklogin, async (req, res) => {
    try {
        if (req.body.contestname === '' || req.body.sdate === '' || req.body.stime === '' || req.body.stime === '' || req.body.edate === '' || req.body.etime === '' || req.body.orgname === '') {
            res.send('Fields should not empty');
        } else {
            const contestDetail = new contestDetails({
                email: req.body.email,
                contestName: req.body.contestname,
                contestStartDate: req.body.sdate,
                contestEndDate: req.body.edate,
                startingTime: req.body.stime,
                endingTime: req.body.etime,
                organisationName: req.body.orgname
            });
            await contestDetail.save();
            res.render('addchallengespage', {
                contestName: req.body.contestname,
                startTime: req.body.stime,
                endTime: req.body.etime,
                orgname: req.body.orgname,
                startDate: req.body.sdate,
                endDate: req.body.edate
            });
        }
    } catch (err) {
        res.status(400).send(err);
    }
});
app.post('/contestDescription', checklogin, async (req, res) => {
    try {
        const contestExra = new contestExtraInfo({

            description: req.body.desc,
            prizes: req.body.prizes,
            rules: req.body.rules
        });

        await contestExra.save();
        res.render('preview', {
            sdate: req.body.sdate,
            stime: req.body.stime,
            contestName: req.body.contestName,
            desc: req.body.desc,
            prizes: req.body.prizes,
            rules: req.body.rules
        });
    } catch (error) {
        res.status(404).send('Page not found');
    }
});
app.post('/createchallenge', checklogin, (req, res) => {
    try {
        res.render('createchallenge', {
            contestName: req.body.contestName
        });
    } catch (error) {
        res.status(404).send('Page not found');
    }
});

app.post('/addchallenge', checklogin, async (req, res) => {
    try {
        if (req.body.contestName === '' || req.body.problem_name === '' || req.body.problem_statement === '' || req.body.input_format === '' ||
            req.body.output_format === '' || req.body.constraints === '' || req.body.sample_input === '' ||
            req.body.sample_output === '') {
            res.send('Fields should not empty');
        } else {
            try {
                var st = req.body.problem_statement;
                console.log(st);
                const problemadd = new addProblem({
                    contestName: req.body.contestName,
                    problemName: (req.body.problem_name).replace(' ', ''),
                    problem_statement: st,
                    input_format: req.body.input_format,
                    output_format: req.body.output_format,
                    constraints: req.body.constraints,
                    sample_input: req.body.sample_input,
                    sample_output: req.body.sample_output,
                    explanation: req.body.explaination,
                    testcase1: req.body.testcase1,
                    testcase2: req.body.testcase2,
                    testcase3: req.body.testcase3,
                    testcase4: req.body.testcase4,
                    testcaseo1: req.body.testcaseo1,
                    testcaseo2: req.body.testcaseo2,
                    testcaseo3: req.body.testcaseo3,
                    testcaseo4: req.body.testcaseo4,
                    score: req.body.score
                });
                console.log(problemadd);
                await problemadd.save();
                console.log(req.body.contestName);
                const problems = await addProblem.find({
                    contestName: req.body.contestName
                });
                console.log(problems);
                res.render('addchallengespage', {
                    contestName: req.body.contestName,
                    problems: problems
                });
            } catch (err) {
                console.log(err);
                res.render('addchallengespage', {
                    contestName: req.body.contestName,
                    problems: []
                });
            }
        }

    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
});
app.post('/updateproblem', checklogin, async (req, res) => {
    try {
        var st = req.body.problem_statement;
        await addProblem.updateOne({
            name: req.body.problemName
        }, {
            problemName: req.body.problem_name,
            problem_statement: st,
            input_format: req.body.input_format,
            output_format: req.body.output_format,
            constraints: req.body.constraints,
            sample_input: req.body.sample_input,
            sample_output: req.body.sample_output,
            explanation: req.body.explaination,
            testcase1: req.body.testcase1,
            testcase2: req.body.testcase2,
            testcase3: req.body.testcase3,
            testcase4: req.body.testcase4,
            testcaseo1: req.body.testcaseo1,
            testcaseo2: req.body.testcaseo2,
            testcaseo3: req.body.testcaseo3,
            testcaseo4: req.body.testcaseo4,
            score: req.body.score
        });
        const problem = await addProblem.find({
            contestName: req.body.contestName
        });

        res.render('edit_problem', {
            pro: problem
        });
    } catch (err) {
        console.log(err);
    }
});
app.post("/submitCode", checklogin, async (req, res) => {
    try {
        var fulltime = new Date();
        var day = new Date().getDate();
        var month = new Date().getMonth();
        var year = new Date().getFullYear();
        var hour = new Date().getHours();
        var min = new Date().getMinutes();
        var sec = new Date().getSeconds();
        var code = req.body.code;
        const token = req.cookies.jwt;
        const verifyUser = await jwt.verify(token, 'ourprojectnameiscodenowwearebuildingaprojetforonlinecoding');
        console.log(req.body.problem_name);
        var filename = `${verifyUser._id}-${req.body.problem_name}`;
        var inputfilename = `./input/${verifyUser._id}-${req.body.problem_name}}`;
        fs.writeFileSync(`./users_code/${filename}.cpp`, code.toString());
        var testcase = await addProblem.find({
            problemName: req.body.problem_name
        });
        var input = [testcase[0].testcase1, testcase[0].testcase2, testcase[0].testcase3, testcase[0].testcase4];
        var ans = [testcase[0].testcaseo1, testcase[0].testcaseo2, testcase[0].testcaseo3, testcase[0].testcaseo4];
        var result = true;
        console.log(ans);
        console.log(input);
        var reqpath = path.join(__dirname);
        var filepath = path.join(reqpath, 'users_code', filename);
        for (var i = 0; i < input.length; i++) {
            // console.log(ans[i]);
            fs.writeFileSync(`${inputfilename}.txt`, input[i].toString());
            // console.log(input[i].toString());
            var newpath = reqpath;
            // gcc sourcefile_name.c -o outputfile.exe
            // g++ -o test "+reqpath+"./test.cpp&test.exe
            // console.log(reqpath);
            var command = `g++ ${filepath}.cpp -o ./users_code/${filename}.exe`;
            // console.log('Command: '+command);
            var child = sh.spawnSync(command, {
                shell: true
            });
            // console.log(child.stderr.toString());
            // console.log('just just after command');
            if (child.stderr.toString().length != 0)
                op = child.output[2].toString();
            else if (input.toString().length == 0)
                op = child.output[1].toString();

            // console.log('after command');
            // console.log(child.stderr.toString());
            if (child.stderr.toString().length == 0) {
                // var newcmd   = newpath + "testc < ./codes/input.txt";
                // F:\React\TryForIde\test < ./input.txt
                // console.log('hello');
                var newcmd = `${__dirname}/users_code/${filename} < ${__dirname}${inputfilename}.txt`
                // console.log('newcmd: ', newcmd);
                var start = performance.now();
                var child1 = sh.spawnSync(newcmd, {
                    shell: true
                });
                // console.log(child1.output[1].toString());
                var end = performance.now();
                // console.log("execution time is----  ");
                // console.log((end - start) / 1000);
                execution_time = (end - start);
                if (child1.stderr.toString().length == 0) {
                    op = child1.output[1].toString();
                    verdict = "Accepted";
                } else {
                    op = child1.output[2].toString();
                    verdict = "Runtime Error";
                }
                // pidusage(child1.pid, function (err, stats) {
                // console.log(stats.memory);
                // });
            } else if (child.stderr.toString().length != 0) {
                verdict = "Compilation Error";
            } else {
                verdict = "Accepted";
            }
            op = await op.trim();
            if (op !== ans[i]) {
                result = false;
                console.log(op);
                console.log(ans[i]);
                break;
            }
        }
        if (result) {
            const findmail = await Register.findOne({
                _id: verifyUser._id
            });
            const findscore = await addProblem.findOne({
                problemName: req.body.problem_name
            });
            console.log(findmail.email);
            var pastscore = undefined;
            var pasts = 0;
            try {
                pastscore = await submission.findOne({
                    email: findmail.email,
                    contestName: findscore.contestName
                })
                console.log(pastscore.problem_names);
                var exist = false;
                pasts = pastscore.score;
                for (var i = 0; i < (pastscore.problem_names).length; i++) {
                    if (req.body.problem_name === (pastscore.problem_names)[0].name) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) pastscore.addNameOf(req.body.problem_name);

                if (!exist) {
                    await submission.updateOne({
                        email: findmail.email,
                        contestName: findscore.contestName
                    }, {
                        email: findmail.email,
                        submittedCode: req.body.code,
                        status: Boolean(result),
                        timeOfSubmission: fulltime,
                        score: (parseInt(pasts) + parseInt(findscore.score)),
                    })
                }
            } catch (err) {
                var subm = new submission({
                    email: findmail.email,
                    submittedCode: req.body.code,
                    status: Boolean(result),
                    timeOfSubmission: fulltime,
                    score: (parseInt(pasts) + parseInt(findscore.score)),
                    contestName: findscore.contestName
                });
                subm.problem_names = subm.problem_names.concat({
                    name: req.body.problem_name
                });
                await subm.save();
            }
            const problems = await addProblem.find({
                contestName: findscore.contestName
            });
            res.render('problem_shown', {
                accepted: true,
                problem: problems,
                contestName: findscore.contestName
            });
        } else {
            const findmail = await Register.findOne({
                _id: verifyUser._id
            });
            const findscore = await addProblem.findOne({
                problemName: req.body.problem_name
            });
            console.log(findmail.email);
            var pastscore = undefined;
            var pasts = 0;
            try {
                pastscore = await submission.findOne({
                    email: findmail.email,
                    contestName: findscore.contestName
                })
                console.log(pastscore.problem_names);
                var exist = false;
                pasts = pastscore.score;
                for (var i = 0; i < (pastscore.problem_names).length; i++) {
                    if (req.body.problem_name === (pastscore.problem_names)[0].name) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) pastscore.addNameOf(req.body.problem_name);

                if (!exist) {
                    await submission.updateOne({
                        email: findmail.email,
                        contestName: findscore.contestName
                    }, {
                        email: findmail.email,
                        submittedCode: req.body.code,
                        status: Boolean(result),
                        timeOfSubmission: fulltime,
                        score: (parseInt(pasts) + parseInt(findscore.score)),
                    })
                }
            } catch (err) {
                var subm = new submission({
                    email: findmail.email,
                    submittedCode: req.body.code,
                    status: Boolean(result),
                    timeOfSubmission: fulltime,
                    score: (parseInt(pasts) + parseInt(0)),
                    contestName: findscore.contestName
                });
                subm.problem_names = subm.problem_names.concat({
                    name: req.body.problem_name
                });
                await subm.save();
            }
            const problems = await addProblem.find({
                problem: findscore.contestName
            });
            res.render('problem_shown', {
                accepted: false,
                giveornot:true,
                problem: problems,
                contestName: findscore.contestName
            });
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});
app.listen(3000, () => {
    console.log('server is running in http:localhost:3000');
});