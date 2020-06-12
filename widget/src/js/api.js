const API_HTTP_METHOD_GET = 'GET';
const API_HTTP_METHOD_POST = 'POST';

const API_BASE_URL = 'http://127.0.0.1:42080/api';
const API_COMMENTATOR_ID = 'pandora';
const API_LANG = 'ru';

// const API_BASE_URL = '#lang#api_base_url#';
// const API_COMMENTATOR_ID = '#lang#api_commentator_id#';
// const API_LANG = '#lang#language#';

const API_VALUE_COMMENT_SIDE_POSITIVE = 'p';
const API_VALUE_COMMENT_SIDE_NEGATIVE = 'n';

const API_PARAM_COMMENTATOR_ID = '_';
const API_PARAM_LANG = 'a';
const API_PARAM_LIMIT = 'b';
const API_PARAM_NEWEST_ID = 'c';
const API_PARAM_TEXT = 'd';
const API_PARAM_SIDE = 'e';
const API_PARAM_NAME = 'f';
const API_PARAM_COMMENTS = 'g';
const API_PARAM_ID = 'h';
const API_PARAM_CREATED_AT = 'i';
const API_PARAM_OK = 'j';
const API_PARAM_ERROR = 'k';
const API_PARAM_CODE = 'l';
const API_PARAM_REASON = 'm';
const API_PARAM_POSITIVE_COMMENTS = 'n';
const API_PARAM_NEGATIVE_COMMENTS = 'o';
const API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT = 'p';
const API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT = 'q';
const API_PARAM_OLDEST_ID = 'r';
const API_PARAM_NEWEST_POSITIVE_ID = 's';
const API_PARAM_OLDEST_POSITIVE_ID = 't';
const API_PARAM_NEWEST_NEGATIVE_ID = 'u';
const API_PARAM_OLDEST_NEGATIVE_ID = 'v';
const API_PARAM_LIKES = 'w';
const API_PARAM_COMMENTS_IDS = 'x';
const API_PARAM_UPDATES_FOR_COMMENTS = 'y';
const API_PARAM_COMMENT_ID = 'z';
const API_PARAM_LIKE = 'A';
const API_PARAM_APP_USER_TOKEN = 'B';
const API_PARAM_LIKED_BY_ME = 'C';

const API_METHOD_CREATE_COMMENT = '/-';
const API_METHOD_GET_COMMENTS_DUAL = '/_';
const API_METHOD_GET_COMMENTS_MONO = '/a';
const API_METHOD_GET_UPDATES_FOR_COMMENTS_IDS = '/b';
const API_METHOD_LIKE_COMMENT = '/c';
const API_METHOD_REPLY_TO_COMMENT = '/d';

const apiExtractError = function(jsonResponse) {
    jsonResponse = jsonResponse || apiCommunicationError;

    return jsonResponse &&
        jsonResponse[API_PARAM_ERROR] &&
        jsonResponse[API_PARAM_ERROR][API_PARAM_REASON] ||
        '#lang#api_error_unknown_reason#';
};

const apiRequestFailed = function(jsonResponse) {
    return Boolean(!jsonResponse || jsonResponse[API_PARAM_ERROR]);
}

const apiCommunicationError = {
    [API_PARAM_ERROR]: {
        [API_PARAM_CODE]: -1,
    },
};
