import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(request, response) {
    response.status(200).json({"redis": redisClient.isAlive(), "db": dbClient.isAlive()});
  }

  static getStats(request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    response.status(200).json({"users": users, "files": files});
  }
}

module.exports = AppController;
