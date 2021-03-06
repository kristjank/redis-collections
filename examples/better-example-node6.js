// const redis = require('redis')
const redis = require('fakeredis')
// const {Store, RedisSet, RedisIdToSet, RedisIdToMap} = require("redis-collections")
const {Store, RedisSet, RedisIdToSet, RedisIdToMap} = require("..")

const store = new Store(redis.createClient())
const users = {
    list: new RedisSet('users'),
    settings: new RedisIdToMap('user:${userId}:settings'),
    friends: new RedisIdToSet('user:${userId}:friends')
}

const createUsers = [
    users.list.addAll(["U1", "U2"]),
    users.settings.setAll("U1", {name: "USER1"}),
    users.settings.setAll("U2", {name: "USER2"}),
    users.friends.add("U1", "U2"),
    users.friends.add("U2", "U1")
]
console.log("createUsers =", createUsers)

store.promise(createUsers)
    .then(()=>store.promise(users.list.getList()))
    .then((userIds)=> {
        console.log("userIds =", userIds)

        const loadList = userIds.map(userId => ({
            id: userId,
            settings: users.settings.getMap(userId),
            friends: users.friends.getList(userId)
        }))
        console.log("loadList =", loadList)

        return store.promise(loadList)
    })
    .then((userList)=>{
        console.log("userList =", userList)
    })

