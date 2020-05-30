import './renamer.dart';

String getParam(String name, {
    Map<String, dynamic> body,
    Map<String, String> query,
    String defaultValue = '',
}) {
    String value;

    if (body != null) {
        value = body[name] ?? body[renamer(name)];
        if (value != null) return value;
    }

    if (query != null) {
        value = query[name] ?? query[renamer(name)];
        if (value != null) return value;
    }

    return defaultValue;
}
