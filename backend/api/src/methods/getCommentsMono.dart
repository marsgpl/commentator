import 'dart:math';
import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../constants.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// appUserToken=zzz
// commentatorId=pandora
// lang=ru
// limit=20
// newestId=fffffffff
// oldestId=fffffffff
Future<Map<String, dynamic>> getCommentsMono(
    RequestInfo reqInfo,
    Db mongo,
) async {
    final getParam = reqInfo.getParam;

    final appUserToken = getParam('appUserToken');
    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    int limit = max(1, min(40, int.parse(getParam('limit', defaultValue: '20'))));
    final newestId = getParam('newestId');
    final oldestId = getParam('oldestId');

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

    final commentsList = await comments.getList(
        limit: limit,
        newestId: newestId,
        oldestId: oldestId,
        appUserToken: appUserToken,
    );

    final positiveCommentsTotalCount = await comments.totalCount(
        side: COMMENT_SIDE_POSITIVE,
    );

    final negativeCommentsTotalCount = await comments.totalCount(
        side: COMMENT_SIDE_NEGATIVE,
    );

    return {
        renamer('comments'): commentsList,
        renamer('positiveCommentsTotalCount'): positiveCommentsTotalCount,
        renamer('negativeCommentsTotalCount'): negativeCommentsTotalCount,
    };
}
