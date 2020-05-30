import 'dart:io';
import 'package:mongo_dart/mongo_dart.dart';

import '../constants.dart';
import '../entities/Comment.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../getParam.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// commentatorId=abortion
// lang=ru
// text=xyu
// side=p
// name=vasya
Future<Map<String, dynamic>> createComment(
    HttpRequest request,
    Db mongo,
    Map<String, dynamic> body,
) async {
    final commentatorId = getParam('commentatorId', body: body);
    final lang = getParam('lang', body: body);
    final text = getParam('text', body: body);
    final side = getParam('side', body: body);
    final name = getParam('name', body: body);
    final ip = 'x.x.x.x';
    final userAgent = 'xxxx';

    if (text.trim().length < 2) {
        return invalidParamsFromClient('min text length is 2');
    }

    if (side != COMMENT_SIDE_POSITIVE && side != COMMENT_SIDE_NEGATIVE) {
        return invalidParamsFromClient('unknown side');
    }

    final comments = Comments(
        mongo: mongo,
        commentatorId: commentatorId,
        lang: lang,
    );

    if (comments.collection == null) {
        return invalidParamsFromClient('commentatorId + lang does not exist');
    }

    final comment = Comment(
        text: text,
        side: side,
        name: name,
        ip: ip,
        userAgent: userAgent,
    );

    final result = await comments.collection.insert(comment.toMongo());

    if (result == null || result['ok'] != 1 || result['err'] != null) {
        throw Exception('MongoDb collection "${comments.collectionName}" insert error: ${result}');
    }

    return {
        renamer('ok'): 1,
    };
}
