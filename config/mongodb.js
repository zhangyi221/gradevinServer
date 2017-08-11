module.exports = {
  host: 'ds023478.mlab.com',
  port: 23478,
  database: 'db_zy',
  username:'zy001',
  userpassword:'0123456789',
  options: {
    db: {
      native_parser: true
    },
    server: {
      auto_reconnect: true,
      poolSize: 5,
      socketOptions: { 
					keepAlive: 1 
				}
    }
  }
}
