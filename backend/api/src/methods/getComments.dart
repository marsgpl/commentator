import 'dart:io';
import 'dart:math';
import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../constants.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// commentatorId=abortion
// lang=ru
// limit=20
// lastId=fffffffff
Future<Map<String, dynamic>> getComments(
    RequestInfo reqInfo,
    Db mongo,
) async {
    final getParam = reqInfo.getParam;

    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    final limit = max(1, min(40, int.parse(getParam('limit', defaultValue: '20'))));
    final lastId = getParam('lastId');

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
        lastId: lastId,
        limit: limit,
    );

    final negativeComments = await comments.getList(
        side: COMMENT_SIDE_NEGATIVE,
        lastId: lastId,
        limit: limit,
    );

    final positiveCommentsTotalCount = await comments.count(
        side: COMMENT_SIDE_POSITIVE,
    );

    final negativeCommentsTotalCount = await comments.count(
        side: COMMENT_SIDE_NEGATIVE,
    );

    return {
        renamer('positiveComments'): positiveComments,
        renamer('negativeComments'): negativeComments,
        renamer('positiveCommentsTotalCount'): positiveCommentsTotalCount,
        renamer('negativeCommentsTotalCount'): negativeCommentsTotalCount,
    };
}
