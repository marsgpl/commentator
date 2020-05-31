import 'package:mongo_dart/mongo_dart.dart';

import '../constants.dart';
import '../entities/Comment.dart';

class Comments {
    Db mongo;
    DbCollection collection;
    String collectionName;
    String commentatorId;
    String lang;

    Comments({
        this.mongo,
        this.commentatorId,
        this.lang,
    }) {
        initCollection();
    }

    void initCollection() {
        collectionName = '${commentatorId}_${lang}_comments';

        if (AVAILABLE_COLLECTIONS[collectionName] == null) {
            return;
        }

        collection = mongo.collection(collectionName);
    }

    String lastIdOf(List<List<Comment>> lists) {
        String lastId;

        lists.forEach((list) {
            list.forEach((post) {
                if (lastId == null || lastId.compareTo(post.id) > 0) {
                    lastId = post.id;
                }
            });
        });

        return lastId ?? '';
    }

    Future<List<Comment>> getList({
        String side,
        String lastId,
        int limit,
    }) async {
        final selector = where;

        if (side != null && side.length > 0) {
            selector.eq('side', side);
        }

        if (lastId != null && lastId.length > 0) {
            selector.lt('_id', ObjectId.parse(lastId));
        }

        selector
            .sortBy('_id', descending: true)
            .limit(limit);

        return collection
            .find(selector)
            .map((row) => Comment.fromMongo(row))
            .toList();
    }

    Future<int> count({
        String side,
    }) async {
        final selector = where;

        if (side != null && side.length > 0) {
            selector.eq('side', side);
        }

        return collection.count(selector);
    }
}
