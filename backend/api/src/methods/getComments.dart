import 'dart:io';
import 'dart:math';
import 'package:mongo_dart/mongo_dart.dart';

import '../constants.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../getParam.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// commentatorId=abortion
// lang=ru
// limit=20
// lastId=fffffffff
Future<Map<String, dynamic>> getComments(
    HttpRequest request,
    Db mongo,
) async {
    final query = request.uri.queryParameters;

    final commentatorId = getParam('commentatorId', query: query);
    final lang = getParam('lang', query: query);
    final limit = max(1, min(40, int.parse(getParam('limit', query: query, defaultValue: '20'))));
    String lastId = getParam('lastId', query: query);

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

    lastId = comments.lastIdOf([
        positiveComments,
        negativeComments,
    ]);

    final positiveCommentsTotalCount = await comments.count(
        side: COMMENT_SIDE_POSITIVE,
    );

    final negativeCommentsTotalCount = await comments.count(
        side: COMMENT_SIDE_NEGATIVE,
    );

    return {
        renamer('positiveComments'): positiveComments,
        renamer('negativeComments'): negativeComments,
        renamer('lastId'): lastId,
        renamer('positiveCommentsTotalCount'): positiveCommentsTotalCount,
        renamer('negativeCommentsTotalCount'): negativeCommentsTotalCount,
    };
}
