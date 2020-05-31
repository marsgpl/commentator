const TEXT_MAX_LENGTH = 2048;

final newlineRegexp = RegExp(r'\n', multiLine: true);

String normalizeText(String text) {
    List<String> lines = [];

    final origTextLines = text
        .trim()
        .split(newlineRegexp);

    int emptyLinesBefore = 0;

    origTextLines.forEach((line) {
        line = line.trim();

        if (line.length == 0) {
            if (emptyLinesBefore < 1) {
                lines.add(line);
                emptyLinesBefore++;
            }
        } else {
            lines.add(line);
            emptyLinesBefore = 0;
        }
    });

    text = lines.join('\n');

    if (text.length > TEXT_MAX_LENGTH) {
        text = text.substring(0, TEXT_MAX_LENGTH);
    }

    return text;
}
