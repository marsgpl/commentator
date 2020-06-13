import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../constants.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// appUserToken=zzz
// commentatorId=pandora
// lang=ru
// commentId=xxx
// oldestReplyId=xxx
// newestReplyId=xxx
Future<Map<String, dynamic>> getCommentReplies(
    RequestInfo reqInfo,
    Db mongo,
) async {
    final getParam = reqInfo.getParam;

    final appUserToken = getParam('appUserToken');
    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    final commentId = ObjectId.parse(getParam('commentId'));
    final oldestReplyId = getParam('oldestReplyId');
    final newestReplyId = getParam('newestReplyId');

    if (appUserToken.length != API_USER_TOKEN_LENGTH) {
        return invalidParamsFromClient('token');
    }

    final comments = Comments(
        mongo: mongo,
        commentatorId: commentatorId,
        lang: lang,
    );

    if (comments.collection == null) {
        return invalidParamsFromClient('commentatorId + lang does not exist');
    }

    final commentExist = await comments.commentExistById(commentId);

    if (!commentExist) {
        return invalidParamsFromClient('comment does not exist');
    }

    final replies = await comments.getReplies(
        commentId: commentId,
        limit: REPLIES_LIMIT_PER_RESPONSE,
        oldestReplyId: oldestReplyId,
        newestReplyId: newestReplyId,
        appUserToken: appUserToken,
    );

    return {
        renamer('replies'): replies,
    };
}
