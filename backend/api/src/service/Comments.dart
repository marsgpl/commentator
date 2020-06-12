import 'package:mongo_dart/mongo_dart.dart';

import '../constants.dart';
import '../entities/Comment.dart';

class Comments {
    Db mongo;
    DbCollection collection;
    DbCollection likesCollection;
    String collectionName;
    String likesCollectionName;
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
        likesCollectionName = '${collectionName}_likes';

        if (AVAILABLE_COLLECTIONS[collectionName] == null) {
            return;
        }

        collection = mongo.collection(collectionName);
        likesCollection = mongo.collection(likesCollectionName);
    }

    Future<List<Comment>> getList({
        String side,
        String newestId,
        String oldestId,
        int limit,
        String appUserToken,
    }) async {
        SelectorBuilder selector = where;

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

        Map<ObjectId, Comment> commentsById = {};

        final List<Comment> result = await collection
            .find(selector)
            .map((row) {
                final comment = Comment.fromMongo(row);
                commentsById[row['_id']] = comment;
                return comment;
            })
            .toList();

        selector = where
            .oneFrom('commentId', commentsById.keys.toList())
            .eq('appUserToken', appUserToken)
            .fields(['commentId']);

        await likesCollection
            .find(selector)
            .forEach((row) {
                final commentId = row['commentId'];
                final comment = commentsById[commentId];
                comment.likedByMe = true;
            });

        return result;
    }

    Future<Map<String, int>> getUpdatesForIds({
        List<ObjectId> ids,
        int limit = 50,
    }) async {
        Map<String, int> result = {};

        final selector = where
            .oneFrom('_id', ids)
            .fields(['likes'])
            .limit(limit);

        await collection.find(selector).forEach((row) {
            result[row['_id'].toHexString()] = row['likes'] ?? 0;
        });

        return result;
    }

    Future<void> like({
        ObjectId commentId,
        int like,
        String ip,
        String userAgent,
        String cfUid,
        String appUserToken,
    }) async {
        bool needIncrement;

        final selector = where
            .eq('commentId', commentId)
            .eq('appUserToken', appUserToken);

        if (like == 1) {
            final result = await likesCollection.update(selector, {
                'commentId': commentId,
                'ip': ip,
                'userAgent': userAgent,
                'cfUid': cfUid,
                'appUserToken': appUserToken,
            }, upsert: true);

            needIncrement = !result['updatedExisting'];
        } else {
            final result = await likesCollection.remove(selector);

            needIncrement = result['n'] > 0;
        }

        if (needIncrement) {
            await collection.update(where.eq('_id', commentId), {
                '\$inc': {
                    'likes': like == 1 ? 1 : -1,
                },
            });
        }
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
