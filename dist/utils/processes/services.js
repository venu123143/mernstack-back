import redis from "redis";
import { promisify } from "util";
const Rediscache = redis.createClient();
export const GET_ASYNC = promisify(Rediscache.get).bind(Rediscache);
export const SET_ASYNC = promisify(Rediscache.set).bind(Rediscache);
