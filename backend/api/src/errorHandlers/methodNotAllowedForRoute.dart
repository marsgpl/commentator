import 'dart:io';

import '../errors.dart';
import '../renamer.dart';

Map<String, dynamic> methodNotAllowedForRoute(
    HttpRequest request,
) {
    final type = 'METHOD_NOT_ALLOWED_FOR_ROUTE';
    final code = ERROR_CODES[type] ?? 0;
    final reason = (ERROR_REASONS[type] ?? '')
        .replaceAll('%method', request.method)
        .replaceAll('%route', request.uri.path);

    return {
        renamer('error'): {
            renamer('code'): code,
            renamer('reason'): reason,
        }
    };
}
