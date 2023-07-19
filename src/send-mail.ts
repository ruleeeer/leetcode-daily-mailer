import {getTodayQuestion} from 'leetcode-daily-question'
import * as util from "util";

const nodemailer = require('nodemailer');

const transporter = createTransporter();
const fromEMail = getEnvWithErr("FROM_EMAIL");
const toEmails = getEnvWithErr("TO_EMAIL");
const language = getEnvWithDefault("EMAIL_LANGUAGE", "cn").toLowerCase()
const i18n = require('i18n');
i18n.configure({
    locales: ['en', 'cn'],
    directory: __dirname + '/locales',
    defaultLocale: language
});
const __ = i18n.__;
const toEmailArr = toEmails.split(",");
const projectUrl = "https://github.com/ruleeeer/leetcode-daily-mailer";
const htmlTemplate = `  <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
            </head>
            <body>
              <h4>%s：%s</h4>
              <p>${__('difficulty')}：%s</p>
              <div>%s</div>
              <p>
                ${__('question-link')}：<a href="https://leetcode-cn.com/problems/%s">https://leetcode-cn.com/problems/%s</a>
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
                difficulty
            } = todayQuestion;
            let title = '';
            let content = '';
            if (language === 'cn') {
                title = todayQuestion.translatedTitle;
                content = todayQuestion.translatedContent;
            } else {
                title = todayQuestion.title;
                content = todayQuestion.content;
            }
            const html = util.format(htmlTemplate, number, title, difficulty, content, titleSlug, titleSlug, projectUrl, projectUrl)
            const date = new Date();
            const currentDateStr = date.toISOString().slice(0, 10);
            const promiseArr = [];
            for (let toEmail of toEmailArr) {
                const mailOptions = {
                    from: fromEMail,
                    to: toEmail,
                    subject: `${currentDateStr} ${__('leetcode-daily-question')}: ${title}(${difficulty})`,
                    html: html
                };
                promiseArr.push(sendMail(transporter, mailOptions));
            }
            return Promise.allSettled(promiseArr);
        })

}


function sendMail(transporter, mailOptions) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.warn(`send email:{${mailOptions.subject}} from:{${mailOptions.from}} to:{${mailOptions.to}} failed!!`, error)
                reject(error)
            } else {
                console.log(`send email:{${mailOptions.subject}} from:{${mailOptions.from}} to:{${mailOptions.to}} success`)
                resolve(mailOptions)
            }
        });
    })
}

function createTransporter() {
// read environment variables
    const host = getEnvWithErr("SMTP_EMAIL_HOST");
    const smtpPort = getEnvWithDefault("SMTP_PORT", "465")
    const authUser = getEnvWithErr("AUTH_USER");
    const authPass = getEnvWithErr("AUTH_PASS")
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


function getEnvWithDefault(variable, defaultVal) {
    return process.env[variable] ?? defaultVal;
}

function getEnvWithErr(variable) {
    let envVariable = process.env[variable];
    if (!envVariable) {
        throw new Error(`please set environment variable {${variable}}!!`)
    }
    return envVariable;
}

export {sendTodayQuestion}