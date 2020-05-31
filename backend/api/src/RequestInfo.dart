import 'dart:convert';
import 'dart:io';

import './renamer.dart';

final cookiesSplitter = RegExp(r'\s*;\s*', multiLine: true);

class RequestInfo {
    HttpRequest request;

    Map<String, dynamic> _body;
    String _ip;
    String _userAgent;
    String _cfUid;
    Map<String, String> _cookies;

    RequestInfo(this.request);

    Future<Map<String, dynamic>> get body async {
        if (_body == null) {
            _body = await _getBody();
        }

        return _body;
    }

    String get ip {
        if (_ip == null) {
            _ip = _getIp();
        }

        return _ip;
    }

    String get userAgent {
        if (_userAgent == null) {
            _userAgent = _getUserAgent();
        }

        return _userAgent;
    }

    String get cfUid {
        if (_cfUid == null) {
            _cfUid = _getCfUid();
        }

        return _cfUid;
    }

    Map<String, String> get cookies {
        if (_cookies == null) {
            _cookies = _getCookies();
        }

        return _cookies;
    }

    Map<String, String> _getCookies() {
        final raw = getHeader(request, 'cookie') ?? getHeader(request, 'cookies');
        final pairs = raw.split(cookiesSplitter);

        Map<String, String> cookies = {};

        pairs.forEach((pair) {
            pair = pair.trim();
            if (pair.length == 0) return;

            final eqSignPos = pair.indexOf('=');

            if (eqSignPos > -1) {
                final key = pair.substring(0, eqSignPos).trim();
                final value = pair.substring(eqSignPos + 1).trim();
                cookies[key] = value;
            } else {
                cookies[pair] = '';
            }
        });

        return cookies;
    }

    Future<Map<String, dynamic>> _getBody() async {
        if (request.contentLength == 0) return {};

        return json.decode(await utf8.decodeStream(request));
    }

    String _getCfUid() {
        return cookies['__cfduid'] ?? '';
    }

    String getHeader(HttpRequest request, String headerName) {
        final candidates = request.headers[headerName];

        if (candidates == null) return '';

        return candidates.first ?? '';
    }

    String _getIp() {
        final cfip = getHeader(request, 'cf-connecting-ip');
        if (cfip.length > 0) return cfip;

        // we cannot trust x-forwarded-for because it is configurable by user
        // final xip = getHeader(request, 'x-forwarded-for');
        // if (xip.length > 0) return xip;

        return request.connectionInfo.remoteAddress.address;
    }

    String _getUserAgent() {
        return getHeader(request, 'user-agent');
    }

    String getParam(String paramName, {
        String defaultValue = '',
    }) {
        String value;

        final body = _body;
        final query = request.uri.queryParameters;

        if (body != null) {
            value = body[paramName] ?? body[renamer(paramName)];
            if (value != null) return value;
        }

        if (query != null) {
            value = query[paramName] ?? query[renamer(paramName)];
            if (value != null) return value;
        }

        return defaultValue;
    }
}
