const cfg = require('../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: cfg.db_secret,
	database: cfg.db_name
});

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		conn.connect(err => {
			if (err) throw err;
			console.log(`> Connected to database ${cfg.db_name}`);
		});
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
