
function createLogger(events, verbose) {
	const stream = require("stream");

	async function log(...args) {
		await events.emitSerial('output:log', { level: 'verbose', message: args })
	}

	log.isVerbose = verbose;

	log.info = (...args) => {
		events.emitSerial('output:log:info', { level: 'info', message: args })
	}

	log.error = async (...args) => {
		await events.emitSerial('output:log:error', { level: 'error', message: args });
	}

	log.result = async (output) => {
		await events.emitSerial('output:log:result', { level: 'result', message: output });
	}

	log.outStream = new stream.Writable({
		write: function(chunk, encoding, next) {
			log.info(chunk.toString());
			next();
		}
	});

	return log;
}

module.exports = {
	createLogger
}