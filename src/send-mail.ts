import {getTodayQuestion} from 'leetcode-daily-question'

const nodemailer = require('nodemailer');

let transporter = createTransporter();
const fromEMail = getEnvironmentVariableWithErr("FROM_EMAIL");
const toEmail = getEnvironmentVariableWithErr("TO_EMAIL");


async function sendTodayQuestion() {
    return getTodayQuestion()
        .then(todayQuestion => {
            const mailOptions = {
                from: fromEMail,
                to: toEmail,
                subject: todayQuestion.translatedTitle,
                html: todayQuestion.translatedContent
            };
            return sendMail(transporter, mailOptions);
        })

}


function sendMail(transporter, mailOptions) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error)
            } else {
                resolve(mailOptions)
            }
        });
    })
}

function createTransporter() {
// read environment variables
    const host = getEnvironmentVariableWithErr("EMAIL_HOST");
    const smtpPort = getEnvironmentVariableWithDefault("SMTP_PORT", "465")
    const authUser = getEnvironmentVariableWithErr("AUTH_USER");
    const authPass = getEnvironmentVariableWithErr("AUTH_PASS")
// 创建一个邮件传输对象
    return nodemailer.createTransport({
        host: host,
        port: parseInt(smtpPort),
        secure: true,
        auth: {
            user: authUser,
            pass: authPass
        }
    });
}


function getEnvironmentVariableWithDefault(variable, defaultVal) {
    return process.env[variable] ?? defaultVal;
}

function getEnvironmentVariableWithErr(variable) {
    let envVariable = process.env[variable];
    if (!envVariable) {
        throw new Error(`please set environment variable {${variable}}!!`)
    }
    return envVariable;
}

export {sendTodayQuestion}