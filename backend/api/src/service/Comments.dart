import 'package:mongo_dart/mongo_dart.dart';

import '../constants.dart';
import '../entities/Comment.dart';
import '../renamer.dart';

class Comments {
    Db mongo;

    DbCollection collection;
    DbCollection likesCollection;
    DbCollection repliesCollection;

    String collectionName;
    String likesCollectionName;
    String repliesCollectionName;

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
        repliesCollectionName = '${collectionName}_replies';

        if (AVAILABLE_COLLECTIONS[collectionName] == null) {
            return;
        }

        collection = mongo.collection(collectionName);
        likesCollection = mongo.collection(likesCollectionName);
        repliesCollection = mongo.collection(repliesCollectionName);
    }

    Future<List<Comment>> getReplies({
        ObjectId commentId,
        int limit = 50,
        String oldestReplyId,
        String newestReplyId,
        String appUserToken,
    }) async {
        final selector = where.eq('commentId', commentId);

        if (newestReplyId != null && newestReplyId.length > 0) {
            selector.gt('_id', ObjectId.parse(newestReplyId));
        } else if (oldestReplyId != null && oldestReplyId.length > 0) {
            selector.lt('_id', ObjectId.parse(oldestReplyId));
        }

        selector
            .sortBy('_id', descending: true)
            .limit(limit);

        final replies = await repliesCollection
            .find(selector)
            .map((row) {
                final reply = Comment.fromMongo(row);
                return reply;
            })
            .toList();

        // TODO: likes by appUserToken (liked by me + likes count)

        return replies;
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

        final result = await collection
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

    Future<bool> commentExistById(ObjectId commentId) async {
        final selector = where
            .eq('_id', commentId)
            .fields(['_id']);

        final row = await collection.findOne(selector);

        return row != null;
    }

    Future<Map<String, Map<String, dynamic>>> getUpdatesForIds({
        List<ObjectId> ids,
        int limit = 50,
    }) async {
        Map<String, Map<String, dynamic>> result = {};

        final selector = where
            .oneFrom('_id', ids)
            .fields(['likes', 'replies'])
            .limit(limit);

        await collection.find(selector).forEach((row) {
            result[row['_id'].toHexString()] = {
                renamer('likes'): row['likes'] ?? 0,
                renamer('replies'): row['replies'] ?? 0,
            };
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
            final likeRow = {
                'commentId': commentId,
                'ip': ip,
                'userAgent': userAgent,
                'cfUid': cfUid,
                'appUserToken': appUserToken,
            };

            final result = await likesCollection.update(
                selector,
                likeRow,
                upsert: true);

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

    Future<Map<String, dynamic>> replyTo({
        ObjectId commentId,
        String text,
        String name,

        String ip,
        String userAgent,
        String cfUid,
        String appUserToken,
    }) async {
        final replyRow = {
            'commentId': commentId,
            'text': text,
            'name': name,

            'ip': ip,
            'userAgent': userAgent,
            'cfUid': cfUid,
            'appUserToken': appUserToken,
        };

        final result = await repliesCollection.insert(replyRow);

        if (result != null && result['ok'] == 1) {
            await collection.update(where.eq('_id', commentId), {
                '\$inc': {
                    'replies': 1,
                },
            });
        }

        return result;
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
