import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../constants.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../helpers/normalizeName.dart';
import '../helpers/normalizeText.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// appUserToken=zzz
// commentatorId=pandora
// lang=ru
// commentId=xxx
// text=xyu
// name=vasya
Future<Map<String, dynamic>> replyToComment(
    RequestInfo reqInfo,
    Db mongo,
) async {
    await reqInfo.body;
    final getParam = reqInfo.getParam;

    final appUserToken = getParam('appUserToken');
    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    final commentId = ObjectId.parse(getParam('commentId'));
    final text = normalizeText(getParam('text'));
    final name = normalizeName(getParam('name'));
    final ip = reqInfo.ip;
    final userAgent = reqInfo.userAgent;
    final cfUid = reqInfo.cfUid;

    if (appUserToken.length != API_USER_TOKEN_LENGTH) {
        return invalidParamsFromClient('token');
    }

    if (text.trim().length < 2) {
        return invalidParamsFromClient('min text length is 2');
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

    final result = await comments.replyTo(
        commentId: commentId,
        text: text,
        name: name,

        ip: ip,
        userAgent: userAgent,
        cfUid: cfUid,
        appUserToken: appUserToken,
    );

    if (result == null || result['ok'] != 1 || result['err'] != null) {
        throw Exception('MongoDb collection "${comments.repliesCollectionName}" insert error: ${result}');
    }

    return {
        renamer('ok'): 1,
    };
}
