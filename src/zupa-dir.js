const { dirname } = require('path');

const __zupaDirname = dirname(require.resolve('.'));

module.exports = {
	__zupaDirname
}
