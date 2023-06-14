import type {VercelRequest, VercelResponse} from '@vercel/node';
import {sendTodayQuestion} from "../src/send-mail";

export default async function send(
    request: VercelRequest,
    response: VercelResponse,
) {

    const syncMail = async () => {
        return sendTodayQuestion()
            .then(results => {
                console.log(results)
                return {
                    success: results.filter(p => p.status === 'fulfilled').map(p => p.value.to),
                    failed: results.filter(p => p.status === 'rejected').map(p => p.value.to)
                }
            });
    }
    return await within(
        syncMail,
        response,
        10 * 1000
    )
}

async function within(fn, res, duration) {
    const id = setTimeout(() => res.json({
        message: "There was an error with the upstream service!"
    }), duration)

    try {
        let data = await fn()
        clearTimeout(id)
        res.json(data)
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}