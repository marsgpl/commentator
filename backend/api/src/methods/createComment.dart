import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../constants.dart';
import '../entities/Comment.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../helpers/normalizeName.dart';
import '../helpers/normalizeText.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// commentatorId=pandora
// lang=ru
// text=xyu
// side=p
// name=vasya
Future<Map<String, dynamic>> createComment(
    RequestInfo reqInfo,
    Db mongo,
) async {
    await reqInfo.body;
    final getParam = reqInfo.getParam;

    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    final side = getParam('side');
    final text = normalizeText(getParam('text'));
    final name = normalizeName(getParam('name'));
    final ip = reqInfo.ip;
    final userAgent = reqInfo.userAgent;
    final cfUid = reqInfo.cfUid;

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
        cfUid: cfUid,
    );

    final result = await comments.collection.insert(comment.toMongo());

    if (result == null || result['ok'] != 1 || result['err'] != null) {
        throw Exception('MongoDb collection "${comments.collectionName}" insert error: ${result}');
    }

    return {
        renamer('ok'): 1,
    };
}
