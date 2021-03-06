const axios = require('axios')
const cheerio = require('cheerio')
const { toPDF } = require('../../utils')
const { search, getDoujin } = require('nhentai-node-api')
const { compressImage } = require('@adiwajshing/baileys')

module.exports = {
	name: 'getdoujin',
	aliases: ['getdojin'],
	use: 'Ex: !getdoujin 1 <reply chat bot>',
	async execute(msg, wa, args) {
		try {
			const { from, quoted } = msg
			if (quoted && quoted.key.fromMe && quoted.key.id.startsWith('3EB0') && quoted.key.id.endsWith('DOUDESU')) {
				if (!args[0]) return wa.reply(from, 'Input code', msg)
				if (isNaN(args[0])) return wa.reply(from, 'Code must be number', msg)
				await wa.reply(from, 'Loading...', msg)
				let quotedText = quoted.message.conversation || quoted.message.extendedTextMessage.text
				let input = quotedText.split('\n\n')[args[0] - 1].split('Link: ')[1]
				let res
				if (input.includes('chapter')) res = input
				else res = await getLink(input)
				let { title, images } = await download(res)
				let buffer = await toPDF(images)
				let thumbnail = await compressImage(images[0])
				await wa.custom(from, buffer, 'documentMessage', { quoted: msg, filename: `${title}.pdf`, mimetype: 'application/pdf', thumbnail })
			} else wa.reply(from, 'Reply chat bot hasil pencarian doujindesu!', msg)
		} catch (e) {
			wa.reply(msg.from, String(e), msg)
		}
	}
}

function getLink(url) {
	return new Promise((resolve, reject) => {
		axios.get(url).then(({ data }) => {
			let $ = cheerio.load(data)
			let result = Array.from($('div.epsright > span.eps').get().map(v => $(v).find('a').attr('href')))
			// resolve(result)
			resolve(result[0])
		}).catch(reject)
	})
}

function download(url) {
	return new Promise((resolve, reject) => {
		axios.get(url).then(({ data }) => {
			let $ = cheerio.load(data)
			let title = $('div.lm').find('h1').text()
			let link = $('div.chright').find('a').attr('href')
			let images = Array.from($('div.reader-area > img').get().map(v => $(v).attr('src')))
			resolve({ title, link, images })
		}).catch(reject)
	})
}
