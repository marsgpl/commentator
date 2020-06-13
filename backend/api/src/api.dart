import 'dart:io';
import 'dart:convert';
import 'package:mongo_dart/mongo_dart.dart';

import './errorHandlers/methodNotAllowedForRoute.dart';
import './errorHandlers/routeNotFound.dart';
import './errorHandlers/internalError.dart';

import './methods/getCommentsDual.dart';
import './methods/getCommentsMono.dart';
import './methods/createComment.dart';
import './methods/replyToComment.dart';
import './methods/getCommentReplies.dart';
import './methods/likeComment.dart';
import './methods/getUpdatesForCommentsIds.dart';
import './renamer.dart';
import './errorHandlers/invalidParamsFromClient.dart';
import './RequestInfo.dart';

const MONGO_PATH = 'mongodb://root:r_xAf5RPdK7ZOqnYFjvcp57tPKVbx3bc7Uu@mongo:27017/commentators?authSource=admin&appName=api';

Future<void> main() async {
    Db mongo = Db(MONGO_PATH);
    await mongo.open();
    print('Mongo ready');

    final server = await HttpServer.bind(InternetAddress.anyIPv4, 80);
    print('Listening on ${server.address.address}:${server.port}');

    await for (HttpRequest request in server) {
        final response = request.response;
        final method = request.method;
        final uri = request.uri;

        Map<String, dynamic> answer = {};
        bool die = false;

        final reqInfo = RequestInfo(request);

        try {
            if (method == 'OPTIONS') {
                answer = {};
            } else if (
                uri.path == '/api/getCommentsDual' ||
                uri.path == renamer('/api/getCommentsDual')
            ) {
                answer = (method == 'GET') ?
                    await getCommentsDual(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (
                uri.path == '/api/getCommentsMono' ||
                uri.path == renamer('/api/getCommentsMono')
            ) {
                answer = (method == 'GET') ?
                    await getCommentsMono(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (
                uri.path == '/api/getUpdatesForCommentsIds' ||
                uri.path == renamer('/api/getUpdatesForCommentsIds')
            ) {
                answer = (method == 'GET') ?
                    await getUpdatesForCommentsIds(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (
                uri.path == '/api/getCommentReplies' ||
                uri.path == renamer('/api/getCommentReplies')
            ) {
                answer = (method == 'GET') ?
                    await getCommentReplies(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (
                uri.path == '/api/likeComment' ||
                uri.path == renamer('/api/likeComment')
            ) {
                answer = (method == 'POST') ?
                    await likeComment(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (
                uri.path == '/api/createComment' ||
                uri.path == renamer('/api/createComment')
            ) {
                answer = (method == 'POST') ?
                    await createComment(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (
                uri.path == '/api/replyToComment' ||
                uri.path == renamer('/api/replyToComment')
            ) {
                answer = (method == 'POST') ?
                    await replyToComment(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else {
                answer = routeNotFound(request);
            }
        } on FormatException catch (error) {
            answer = invalidParamsFromClient('POST body JSON is malformed', error: error);
        } on ConnectionException catch(error, stacktrace) {
            answer = internalError(error, stacktrace);
            die = true;
        } catch (error, stacktrace) {
            answer = internalError(error, stacktrace);
        }

        response.statusCode = HttpStatus.ok;
        response.headers.contentType = ContentType('application', 'json', charset: 'utf-8');
        response.headers.add('Access-Control-Allow-Origin', '*');
        response.headers.add('Access-Control-Allow-Methods', 'OPTIONS,GET,POST');
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type');

        response.write(json.encode(answer));

        await response.close();

        if (die) {
            exit(1);
        }
    }
}
