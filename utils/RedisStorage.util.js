// Import the Node redis package
import {createClient} from 'redis';

class RedisStore {
  constructor() {
    // Create a new redis client and connect to the server
    this.client = createClient({
      url: process.env.REDIS_URL,
      socket:{
          tls:true,
          timeout:10000,
          keepAlive:10000,
          rejectUnauthorized:false
      }
    });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  /*
    The storeCallback takes in the Session, and sets a stringified version of it on the redis store
    This callback is used for BOTH saving new Sessions and updating existing Sessions.
    If the session can be stored, return true
    Otherwise, return false
  */
  async storeCallback(session, retry = 0) {
    try {
        if(!this.client.isOpen){
            await this.client.connect();
        }
      // Inside our try, we use the `setAsync` method to save our session.
      // This method returns a boolean (true if successful, false if not)
      return await this.client.set(session.id, JSON.stringify(session));
    } catch (err) {
      console.log(`${__filename}::storeCallback`, session, retry, err);
      if (retry > 2) {
        // throw errors, and handle them gracefully in your application
        throw new Error(err);
      }
      retry += 1;
      return await this.storeCallback(session, retry);
    }
  }

  /*
    The loadCallback takes in the id, and uses the getAsync method to access the session data
     If a stored session exists, it's parsed and returned
     Otherwise, return undefined
  */
  async loadCallback(id, retry = 0) {
    try {
        if(!this.client.isOpen){
            await this.client.connect();
        }
      // Inside our try, we use `getAsync` to access the method by id
      // If we receive data back, we parse and return it
      // If not, we return `undefined`
      let reply = await this.client.get(id);
      if (reply) {
        return JSON.parse(reply);
      } else {
        return undefined;
      }
    } catch (err) {
      console.log(`${__filename}::loadCallback`, id, retry, err);
      if (retry > 2) {
        // throw errors, and handle them gracefully in your application
        throw new Error(err);
      }
      retry += 1;
      return await this.loadCallback(id, retry);
    }
  }

  /*
    The deleteCallback takes in the id, and uses the redis `del` method to delete it from the store
    If the session can be deleted, return true
    Otherwise, return false
  */
  async deleteCallback(id, retry = 0) {
    try {
        if(!this.client.isOpen){
            await this.client.connect();
        }
      // Inside our try, we use the `delAsync` method to delete our session.
      // This method returns a boolean (true if successful, false if not)
      return await this.client.del(id);
    } catch (err) {
      console.log(`${__filename}::deleteCallback`, id, retry, err);
      if (retry > 2) {
        // throw errors, and handle them gracefully in your application
        throw new Error(err);
      }
      retry += 1;
      return await this.deleteCallback(id, retry);
    }
  }
}

// Export the class
export default RedisStore;