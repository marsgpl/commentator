import 'dart:io';

import '../errors.dart';
import '../renamer.dart';

Map<String, dynamic> routeNotFound(
    HttpRequest request,
) {
    final type = 'ROUTE_NOT_FOUND';
    final code = ERROR_CODES[type] ?? 0;
    final reason = (ERROR_REASONS[type] ?? '')
        .replaceAll('%route', request.uri.path);

    return {
        renamer('error'): {
            renamer('code'): code,
            renamer('reason'): reason,
        }
    };
}
