import '../errors.dart';
import '../renamer.dart';

Map<String, dynamic> internalError(
    dynamic error,
    StackTrace stacktrace,
) {
    final type = 'INTERNAL_ERROR';
    final code = ERROR_CODES[type] ?? 0;
    final reason = ERROR_REASONS[type] ?? 'Internal error';

    print('Internal server error: $error');
    print('Internal server error: $stacktrace');

    return {
        renamer('error'): {
            renamer('code'): code,
            renamer('reason'): reason,
        }
    };
}
