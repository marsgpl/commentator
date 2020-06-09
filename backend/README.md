# Commentator backend

## Prepare for deploy

    ./upload.sh

## Deploy

    ./deploy.sh mongo
    ./deploy.sh api

## Links

    <https://dart.dev/tutorials/server/httpserver>
    <https://pub.dev/packages/http_server>
    <https://pub.dev/packages/mongo_dart>

## Local

    docker network create commentator

    docker-compose up -d mongo
    docker-compose up api

    docker-compose up -d --build --force-recreate mongo
    docker-compose up --build --force-recreate api

    docker-compose logs -f mongo

## DB

    docker exec -it commentator_mongo_1 mongo 'mongodb://root:r_xAf5RPdK7ZOqnYFjvcp57tPKVbx3bc7Uu@mongo:27017/commentators?authSource=admin&appName=cli'

    db.disableFreeMonitoring();
    db.getProfilingLevel();
    show databases;
    use commentators;
    show collections;
    db.pandora_ru_comments.count();
    db.pandora_ru_comments.find({}).sort({ _id: -1 }).limit(1).pretty();
    db.pandora_ru_comments.count({ text: /хуй/i });
    db.pandora_ru_comments.find({ text: /хуй/i }).pretty();

    db.pandora_ru_comments.find(
        {$text: {$search: "хуй"}},
        {score: {$meta: "textScore"}}
    ).sort({
        score: { $meta: "textScore" }
    });

    db.pandora_ru_comments.aggregate(
        {$group: {_id: "$name", count: {$sum: 1}}},
        {$match: {count: {$gt: 1}}},
        {$sort: {count: -1}},
        {$project: {_id: 0, name: "$_id", count: "$count"}});

    db.pandora_ru_comments.remove({})

    for (let i=0; i<200; i++) db.pandora_ru_comments.insert({
        "createdAt" : new Date,
        "text" : Math.random()+'',
        "side" : "p",
        "name" : Math.random()+'',
        "ip" : "1.1.1.1",
        "userAgent" : "xxx",
        "cfUid" : "",
        "appUserToken": "lolo"
    })

    for (let i=0; i<10; i++) db.pandora_ru_comments.insert({
        "createdAt" : new Date,
        "text" : Math.random()+'',
        "side" : "n",
        "name" : Math.random()+'',
        "ip" : "1.1.1.1",
        "userAgent" : "xxx",
        "cfUid" : "",
        "appUserToken": "lolo"
    })

    db.abortion_ru_comments.drop()
    db.pandora_ru_comments.drop()
    db.deathpen_ru_comments.drop()
    db.deppherd_ru_comments.drop()
    db.abortion_ru_comments_likes.drop()
    db.pandora_ru_comments_likes.drop()
    db.deathpen_ru_comments_likes.drop()
    db.deppherd_ru_comments.drop()

## DB indexes

    use commentators;

    db.abortion_ru_comments.ensureIndex({ "side": 1, "_id": 1 });
    db.abortion_ru_comments.ensureIndex({ "appUserToken": 1 });
    db.abortion_ru_comments.ensureIndex({ "text": "text" });
    db.abortion_ru_comments_likes.ensureIndex({ "commentId": 1, "appUserToken": 1 }, { "unique": 1 });

    db.pandora_ru_comments.ensureIndex({ "side": 1, "_id": 1 });
    db.pandora_ru_comments.ensureIndex({ "appUserToken": 1 });
    db.pandora_ru_comments.ensureIndex({ "text": "text" });
    db.pandora_ru_comments_likes.ensureIndex({ "commentId": 1, "appUserToken": 1 }, { "unique": 1 });

    db.deathpen_ru_comments.ensureIndex({ "side": 1, "_id": 1 });
    db.deathpen_ru_comments.ensureIndex({ "appUserToken": 1 });
    db.deathpen_ru_comments.ensureIndex({ "text": "text" });
    db.deathpen_ru_comments_likes.ensureIndex({ "commentId": 1, "appUserToken": 1 }, { "unique": 1 });

    db.deppherd_ru_comments.ensureIndex({ "side": 1, "_id": 1 });
    db.deppherd_ru_comments.ensureIndex({ "appUserToken": 1 });
    db.deppherd_ru_comments.ensureIndex({ "text": "text" });
    db.deppherd_ru_comments_likes.ensureIndex({ "commentId": 1, "appUserToken": 1 }, { "unique": 1 });

## Move DB comments to local

    ssh commentator@marsgpl 'docker exec -t commentator_mongo_1 mongoexport --uri="mongodb://root:r_xAf5RPdK7ZOqnYFjvcp57tPKVbx3bc7Uu@mongo:27017/commentators?authSource=admin" --collection=pandora_ru_comments --out=/data/db/pandora_ru_comments.json'

    scp commentator@marsgpl:/home/commentator/mongo-data/pandora_ru_comments.json ./mongo-data/

    ssh root@marsgpl 'rm /home/commentator/mongo-data/pandora_ru_comments.json'

    docker exec -t commentator_mongo_1 mongoimport --uri="mongodb://root:nl7QkdoQiqIEnSse8IMgBUfEp7gOThr2@mongo:27017/commentators?authSource=admin" --collection=pandora_ru_comments --file=/data/db/pandora_ru_comments.json --drop

    rm ./mongo-data/pandora_ru_comments.json

    add indexes
