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

    Future<List<Comment>> getList({
        String side,
        String newestId,
        String oldestId,
        int limit,
    }) async {
        final selector = where;

        if (side != null && side.length > 0) {
            selector.eq('side', side);
        }

        if (newestId != null && newestId.length > 0) {
            selector.gt('_id', ObjectId.parse(newestId));
        } else if (oldestId != null && oldestId.length > 0) {
            selector.lt('_id', ObjectId.parse(oldestId));
        }

        selector
            .sortBy('_id', descending: true)
            .limit(limit);

        return collection
            .find(selector)
            .map((row) => Comment.fromMongo(row))
            .toList();
    }

    Future<int> totalCount({
        String side,
    }) async {
        final selector = where;

        if (side != null && side.length > 0) {
            selector.eq('side', side);
        }

        return collection.count(selector);
    }
}
