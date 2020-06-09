import 'dart:math';
import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// appUserToken=zzz
// commentatorId=pandora
// lang=ru
// commentId=xxx
// like=1 (1 - put like, 0 - remove like)
Future<Map<String, dynamic>> likeComment(
    RequestInfo reqInfo,
    Db mongo,
) async {
    await reqInfo.body;
    final getParam = reqInfo.getParam;

    final appUserToken = getParam('appUserToken');
    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    final commentId = ObjectId.parse(getParam('commentId'));
    int like = max(0, min(1, int.parse(getParam('like'))));
    final ip = reqInfo.ip;
    final userAgent = reqInfo.userAgent;
    final cfUid = reqInfo.cfUid;

    if (appUserToken.length != 36) {
        return invalidParamsFromClient('invalid token');
    }

    final comments = Comments(
        mongo: mongo,
        commentatorId: commentatorId,
        lang: lang,
    );

    if (comments.collection == null) {
        return invalidParamsFromClient('commentatorId + lang does not exist');
    }

    await comments.like(
        commentId: commentId,
        like: like,
        ip: ip,
        userAgent: userAgent,
        cfUid: cfUid,
        appUserToken: appUserToken,
    );

    return {
        renamer('ok'): 1,
    };
}
