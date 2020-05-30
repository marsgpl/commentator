import '../errors.dart';
import '../renamer.dart';

Future<Map<String, dynamic>> invalidParamsFromClient(
    String details,
    {
        dynamic error = null,
    }
) async {
    final type = 'INVALID_PARAMS_FROM_CLIENT';
    final code = ERROR_CODES[type] ?? 0;
    final reason = (ERROR_REASONS[type] ?? '')
        .replaceAll('%details', details);

    if (error != null) {
        print('invalidParamsFromClient error: $error');
    }

    return {
        renamer('error'): {
            renamer('code'): code,
            renamer('reason'): reason,
        }
    };
}
