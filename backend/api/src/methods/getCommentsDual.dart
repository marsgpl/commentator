import 'dart:math';
import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../constants.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// commentatorId=pandora
// lang=ru
// limit=20
// newestPositiveId=fffffffff
// oldestPositiveId=fffffffff
// newestNegativeId=fffffffff
// oldestNegativeId=fffffffff
Future<Map<String, dynamic>> getCommentsDual(
    RequestInfo reqInfo,
    Db mongo,
) async {
    final getParam = reqInfo.getParam;

    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    int limit = max(1, min(40, int.parse(getParam('limit', defaultValue: '20'))));
    final newestPositiveId = getParam('newestPositiveId');
    final oldestPositiveId = getParam('oldestPositiveId');
    final newestNegativeId = getParam('newestNegativeId');
    final oldestNegativeId = getParam('oldestNegativeId');

    final comments = Comments(
        mongo: mongo,
        commentatorId: commentatorId,
        lang: lang,
    );

    if (comments.collection == null) {
        return invalidParamsFromClient('commentatorId + lang does not exist');
    }

    final positiveComments = await comments.getList(
        side: COMMENT_SIDE_POSITIVE,
        limit: limit,
        newestId: newestPositiveId,
        oldestId: oldestPositiveId,
    );

    final negativeComments = await comments.getList(
        side: COMMENT_SIDE_NEGATIVE,
        limit: limit,
        newestId: newestNegativeId,
        oldestId: oldestNegativeId,
    );

    final positiveCommentsTotalCount = await comments.totalCount(
        side: COMMENT_SIDE_POSITIVE,
    );

    final negativeCommentsTotalCount = await comments.totalCount(
        side: COMMENT_SIDE_NEGATIVE,
    );

    final likesForLatestComments = await comments.getLikesForLatest(
        limit: limit,
        anySide: false,
    );

    return {
        renamer('positiveComments'): positiveComments,
        renamer('negativeComments'): negativeComments,
        renamer('positiveCommentsTotalCount'): positiveCommentsTotalCount,
        renamer('negativeCommentsTotalCount'): negativeCommentsTotalCount,
        renamer('likesForLatestComments'): likesForLatestComments,
    };
}
