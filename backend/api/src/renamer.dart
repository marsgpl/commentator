const DICT = {
    'commentatorId': '_',
    'lang': 'a',
    'limit': 'b',
    'newestId': 'c',
    'text': 'd',
    'side': 'e',
    'name': 'f',
    'comments': 'g',
    'id': 'h',
    'createdAt': 'i',
    'ok': 'j',
    'error': 'k',
    'code': 'l',
    'reason': 'm',
    'positiveComments': 'n',
    'negativeComments': 'o',
    'positiveCommentsTotalCount': 'p',
    'negativeCommentsTotalCount': 'q',
    'oldestId': 'r',

    '/api/getComments': '/api/_',
    '/api/createComment': '/api/-',
};

String renamer(String name) {
    return DICT[name] ?? name;
}
