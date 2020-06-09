import 'package:mongo_dart/mongo_dart.dart';

import '../RequestInfo.dart';
import '../errorHandlers/invalidParamsFromClient.dart';
import '../renamer.dart';
import '../service/Comments.dart';

// commentatorId=pandora
// lang=ru
// commentsIds=[xxx,yyy,zzz]
Future<Map<String, dynamic>> getLikesForCommentsIds(
    RequestInfo reqInfo,
    Db mongo,
) async {
    final getParam = reqInfo.getParam;

    final commentatorId = getParam('commentatorId');
    final lang = getParam('lang');
    final commentsIds = getParam('commentsIds').split(',').map(ObjectId.parse).toList();

    final comments = Comments(
        mongo: mongo,
        commentatorId: commentatorId,
        lang: lang,
    );

    if (comments.collection == null) {
        return invalidParamsFromClient('commentatorId + lang does not exist');
    }

    final likesForComments = await comments.getLikesForIds(ids: commentsIds);

    return {
        renamer('likesForComments'): likesForComments,
    };
}
