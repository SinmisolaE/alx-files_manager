import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  static postNew(request, response) {
    const { email } = response.body;
    const { password } = response.body;

    if (!email) {
      response.status(400).json({ error: 'Missing email'});
      return;
    }

    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    const users = dbClient.db.collection('users');
    users.findOne({ email }, (err, user) {
      if (user) {
        response.status(400).json({ error: 'Already exist' });
      } else {
        const hashed_password = sha1(password);
        users.insertOne(
	  {
	    email,
            password: hashed_password,
	  },
	).then((result) => {
	  response.status(201).json({ id: result.insertId, email });
          userQueue.add({ userId: result.insertedId });
	}).catch((error) => console.log(error));
      }
    });
  }

  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const user = dbClient.db.collection('users');
      const idObject = new ObjectID('userId');
      users.findOne({ _id: idObject }, (err, user) {
        if (user) {
	  response.status(200).json({ id: userId, email:user.email });
	} else {
	  response.status(401).json({ error: 'Unauthorized'});
	}
      });
    } else {
      console.log('Hupatikani!');
      response.status(401).json({ error: 'Unauthorized '});
    }
  }
}

module.exports = UsersController;
