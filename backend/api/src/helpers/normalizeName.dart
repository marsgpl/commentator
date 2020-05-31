const NAME_MAX_LENGTH = 64;

final multiSpaceLineRegexp = RegExp(r'\s+', multiLine: true);

String normalizeName(String name) {
    name = name
        .trim()
        .replaceAll(multiSpaceLineRegexp, ' ');

    if (name.length > NAME_MAX_LENGTH) {
        name = name.substring(0, NAME_MAX_LENGTH);
    }

    return name;
}
