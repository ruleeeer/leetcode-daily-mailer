import {getTodayQuestion} from 'leetcode-daily-question'
import * as util from "util";

const nodemailer = require('nodemailer');

let transporter = createTransporter();
const fromEMail = getEnvironmentVariableWithErr("FROM_EMAIL");
const toEmail = getEnvironmentVariableWithErr("TO_EMAIL");
const projectUrl = "https://github.com/ruleeeer/leetcode-daily-mailer";
const htmlTemplate = `  <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
            </head>
            <body>
              <h4>%s：%s</h4>
              <p>难度：%s</p>
              <div>%s</div>
              <p>
                原题链接：<a href="https://leetcode-cn.com/problems/%s">https://leetcode-cn.com/problems/%s</a>
              </p>
              </br>
              </br>
              <HR>
              <p>
                github：<a href="%s">%s</a>
              </p>
            </body>
            </html>`;

async function sendTodayQuestion() {
    return getTodayQuestion()
        .then(todayQuestion => {
            const {
                titleSlug,
                questionFrontendId: number,
                translatedTitle: title,
                difficulty,
                translatedContent
            } = todayQuestion;
            const html = util.format(htmlTemplate, number, title, difficulty, translatedContent, titleSlug, titleSlug, projectUrl, projectUrl)
            const date = new Date();
            const currentDateStr = date.toISOString().slice(0, 10);
            const mailOptions = {
                from: fromEMail,
                to: toEmail,
                subject: `${currentDateStr} Leetcode每日一题: ${title}`,
                html: html
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
    const host = getEnvironmentVariableWithErr("SMTP_EMAIL_HOST");
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