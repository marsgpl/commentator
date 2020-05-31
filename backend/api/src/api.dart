import 'dart:io';
import 'dart:convert';
import 'package:mongo_dart/mongo_dart.dart';

import './errorHandlers/methodNotAllowedForRoute.dart';
import './errorHandlers/routeNotFound.dart';
import './errorHandlers/internalError.dart';

import './methods/getComments.dart';
import './methods/createComment.dart';
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
            } else if (uri.path == '/api/getComments' || uri.path == renamer('/api/getComments')) {
                answer = (method == 'GET') ?
                    await getComments(reqInfo, mongo) :
                    methodNotAllowedForRoute(request);
            } else if (uri.path == '/api/createComment' || uri.path == renamer('/api/createComment')) {
                answer = (method == 'POST') ?
                    await createComment(reqInfo, mongo) :
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
