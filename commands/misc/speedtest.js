module.exports = {
	name: 'speedtest',
	category: 'general',
	execute(msg, wa, args) {
		require('child_process').exec('speed-test -j', (error, stdout, stderr) => {
			if (error) return wa.reply(msg.from, `Error: ${error}`, msg)
			if (stderr) return wa.reply(msg.from, `Stderr: ${stderr}`, msg)
			wa.reply(msg.from, `Output: ${stdout}`, msg)
		})
	}
}