module.exports = {
  // host: 'ds023478.mlab.com',
  // port: 23478,
  // database: 'db_zy',
  host: 'cluster0-shard-00-00-jvpv7.mongodb.net:27017,cluster0-shard-00-01-jvpv7.mongodb.net:27017,cluster0-shard-00-02-jvpv7.mongodb.net',
  port: 27017,
  database: 'db_zy?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
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
