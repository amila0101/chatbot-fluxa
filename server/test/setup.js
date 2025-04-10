const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

module.exports = {
  connect: async () => {
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  },

  closeDatabase: async () => {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongod.stop();
    } catch (error) {
      console.error('Database cleanup error:', error);
      throw error;
    }
  },

  clearDatabase: async () => {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
      }
    } catch (error) {
      console.error('Database clear error:', error);
      throw error;
    }
  }
};

