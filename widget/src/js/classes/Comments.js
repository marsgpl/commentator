class Comments {
    /**
     * @param {Dialog} dialog
     * @param {StatusRow} statusRow
     */
    constructor(dialog, statusRow, replyToCommentModal) {
        /** @type {number} */ this.dateRefresherInterval;
        /** @type {number} */ this.commentRefresherInterval;

        /** @type {Function} */ this.recalcColsHeights;
        /** @type {Function} */ this.getMinContentHeight;
        /** @type {Function} */ this.refreshDates;
        /** @type {Function} */ this.removeLoaders;
        /** @type {Function} */ this.addPaginationLoaders;
        /** @type {Function} */ this.getParamsForLoadComments;
        /** @type {Function} */ this.getUrlForLoadComments;
        /** @type {Function} */ this.getCommentsListFromLoadCommentsAnswer;
        /** @type {Function} */ this.toggleNoMsgsNotice;
        /** @type {Function} */ this.recalcIdsIndexAndPresence;
        /** @type {Function} */ this.getParentContainerForComment;
        /** @type {Function} */ this.areColsDisplayed;
        /** @type {Function} */ this.wrapComment;
        /** @type {Function} */ this.checkCanPaginateFurther;

        this.isColumnVisible = false;
        this.dialog = dialog;
        this.statusRow = statusRow;
        this.replyToCommentModal = replyToCommentModal;

        this.canPaginate = true;
        this.paginationInProcess = false;
        this.canAutoRefresh = true;
        this.commentsEverLoaded = false;
        this.shownComments = {};

        bind(window, 'scroll', this.onScroll.bind(this));
        bind(document, 'visibilitychange', this.onWindowVisibilityChange.bind(this));
        bind(window, 'resize', this.onWindowResize.bind(this));

        this.startDateRefresher();
        this.startCommentRefresher();
    }

    updateVisibleComments() {
        if (!this.commentsEverLoaded) return;

        const visibleCommentsIds = [];

        const viewportTop = window.pageYOffset +
            $(CSS_CLASS_HEADER).offsetHeight +
            $(CSS_CLASS_STATUS).offsetHeight;

        const viewportBottom = window.pageYOffset +
            window.innerHeight -
            $(CSS_CLASS_FOOTER).offsetHeight;

        Object.keys(this.shownComments).forEach(commentId => {
            const comment = this.shownComments[commentId];

            const y = comment.offsetTop;
            const h = comment.offsetHeight;

            const isVisible = (y + 15 < viewportBottom && y + h - 15 > viewportTop);

            if (isVisible) {
                visibleCommentsIds.push(commentId);
            }
        });

        this.updateVisibleCommentsApiCall(visibleCommentsIds);
    }

    updateVisibleCommentsApiCall(visibleCommentsIds) {
        if (visibleCommentsIds.length === 0) return;

        ajax(API_HTTP_METHOD_GET, API_BASE_URL + API_METHOD_GET_UPDATES_FOR_COMMENTS_IDS, {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_COMMENTS_IDS]: visibleCommentsIds.join(','),
        }, json => {
            if (apiRequestFailed(json)) return;

            const result = json[API_PARAM_UPDATES_FOR_COMMENTS];

            Object.keys(result).forEach(commentId => {
                const comment = this.shownComments[commentId];
                const newCommentValues = result[commentId];

                this.setLikesCountForComment(comment, newCommentValues[API_PARAM_LIKES]);
                this.refreshRepliesForComment(comment, newCommentValues[API_PARAM_REPLIES]);
            });
        });
    }

    onScroll() {
        if (!this.isColumnVisible) return;
        if (!this.canPaginate) return;
        if (this.paginationInProcess) return;

        const windowHeight = window.innerHeight;
        const scrolledHeight = window.pageYOffset;
        const minContentHeight = this.getMinContentHeight();

        if (minContentHeight + scrolledHeight <= windowHeight) return;

        if (minContentHeight - scrolledHeight - windowHeight <= windowHeight * .7) {
            this.paginationInProcess = true;

            this.loadComments(true, () => {
                this.paginationInProcess = false;
            });
        }
    }

    onWindowVisibilityChange() {
        this.canAutoRefresh = document.visibilityState === 'visible';

        if (this.canAutoRefresh && this.isColumnVisible) {
            this.updateVisibleComments();
            this.loadComments();
            this.refreshDates();
        }
    }

    onWindowResize() {
        const oldValue = this.isColumnVisible;
        const newValue = this.areColsDisplayed();

        this.isColumnVisible = newValue;

        if (newValue && !oldValue) {
            this.onBecomeVisible();
        }
    }

    onBecomeVisible() {
        this.recalcColsHeights();
        this.updateVisibleComments();
        this.loadComments();
        this.refreshDates();
    }

    startDateRefresher() {
        this.dateRefresherInterval = setInterval(() => {
            if (!this.canAutoRefresh) return;
            if (!this.isColumnVisible) return;
            this.refreshDates();
        }, 60000);
    }

    startCommentRefresher() {
        this.commentRefresherInterval = setInterval(() => {
            if (!this.canAutoRefresh) return;
            if (!this.isColumnVisible) return;
            this.updateVisibleComments();
            this.loadComments();
        }, 10000);
    }

    createPaginationLoader() {
        return createNode('div', [
            CSS_CLASS_LOADER,
            CSS_CLASS_COLUMNS_PAGINATION_LOADER,
        ]);
    }

    isCommentLikedByMe(comment) {
        const heart = $(CSS_CLASS_ICON_HEART, comment);
        return heart.classList.contains(CSS_CLASS_ICON_HEART_ACTIVE.substr(1));
    }

    likeComment(comment) {
        const isLiked = this.isCommentLikedByMe(comment);

        const heart = $(CSS_CLASS_ICON_HEART, comment);
        const likesCount = $(CSS_CLASS_COMMENT_LIKES_COUNT, comment);

        const delta = isLiked ? -1 : 1;

        const activeClassName = CSS_CLASS_ICON_HEART_ACTIVE.substr(1);

        if (isLiked) {
            heart.classList.remove(activeClassName);
        } else {
            heart.classList.add(activeClassName);
        }

        likesCount.innerText = Math.max(0, (parseInt(likesCount.innerText, 10) || 0) + delta) || '';

        ajax(API_HTTP_METHOD_POST, API_BASE_URL + API_METHOD_LIKE_COMMENT, {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_COMMENT_ID]: comment[HTML_NODE_FIELD_COMMENT_ID],
            [API_PARAM_LIKE]: isLiked ? '0' : '1',
            [API_PARAM_APP_USER_TOKEN]: APP_USER_TOKEN,
        });
    }

    setLikesCountForComment(comment, newLikesCountValue) {
        const likesCount = $(CSS_CLASS_COMMENT_LIKES_COUNT, comment);

        if (newLikesCountValue < 1 && this.isCommentLikedByMe(comment)) {
            newLikesCountValue = 1;
        }

        likesCount.innerText = newLikesCountValue || '';
    }

    loadComments(isPagination = false, then = null) {
        if (!this.isColumnVisible) return;

        const url = this.getUrlForLoadComments();
        const params = this.getParamsForLoadComments(isPagination);

        if (isPagination) {
            this.addPaginationLoaders();
        }

        ajax(API_HTTP_METHOD_GET, url, params, json => {
            if (apiRequestFailed(json)) {
                const error = apiExtractError(json);

                if (!this.commentsEverLoaded) {
                    this.dialog.showModal(
                        '#lang#init_comments_failed_title#',
                        `#lang#init_comments_failed_message#<br><br>${error}`,
                        '#lang#init_comments_failed_button#',
                        () => {
                            window.location.reload();
                        },
                    );
                }

                return then && then();
            }

            const isFirstLoad = !this.commentsEverLoaded;
            this.commentsEverLoaded = true;

            if (isPagination || isFirstLoad) {
                this.checkCanPaginateFurther(json);
            }

            this.removeLoaders();

            this.statusRow.setSide(
                API_VALUE_COMMENT_SIDE_POSITIVE,
                json[API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT]);

            this.statusRow.setSide(
                API_VALUE_COMMENT_SIDE_NEGATIVE,
                json[API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT]);

            this.addComments(
                isPagination,
                this.getCommentsListFromLoadCommentsAnswer(json),
            );

            this.toggleNoMsgsNotice();
            this.recalcColsHeights();

            if (isFirstLoad) {
                window.scrollTo(0, 0);
            }

            then && then();
        });
    }

    addComments(isPagination, commentsListFromApi) {
        if (!isPagination) {
            commentsListFromApi = commentsListFromApi.reverse();
        }

        commentsListFromApi.forEach(commentFromApi => {
            const id = commentFromApi[API_PARAM_ID];
            const isPositive = commentFromApi[API_PARAM_SIDE] === API_VALUE_COMMENT_SIDE_POSITIVE;

            if (this.shownComments[id]) return;

            const comment = dup($(CSS_CLASS_COMMENT, CSS_CLASS_TEMPLATES));
            const heart = dup($(CSS_CLASS_ICON_HEART, CSS_CLASS_TEMPLATES));
            const author = $(CSS_CLASS_COMMENT_AUTHOR, comment);
            const text = $(CSS_CLASS_COMMENT_TEXT, comment);
            const date = $(CSS_CLASS_COMMENT_DATE, comment);
            const like = $(CSS_CLASS_COMMENT_LIKE, comment);
            const likesCount = $(CSS_CLASS_COMMENT_LIKES_COUNT, comment);
            const reply = $(CSS_CLASS_COMMENT_REPLY, comment);

            this.shownComments[id] = comment;

            const commentCreationTimeStamp = commentFromApi[API_PARAM_ID].substr(0, 8);
            const commentCreationDate = new Date(parseInt(commentCreationTimeStamp, 16) * 1000);

            comment[HTML_NODE_FIELD_COMMENT_ID] = id;
            date[HTML_NODE_FIELD_DATE] = commentCreationDate;
            author.innerText = commentFromApi[API_PARAM_NAME] || '#lang#comment_anonymous_name#';
            text.innerText = commentFromApi[API_PARAM_TEXT];
            likesCount.innerText = commentFromApi[API_PARAM_LIKES] || '';

            if (commentFromApi[API_PARAM_LIKED_BY_ME]) {
                heart.classList.add(CSS_CLASS_ICON_HEART_ACTIVE.substr(1));
            }

            this.refreshRepliesForComment(comment, commentFromApi[API_PARAM_REPLIES]);
            this.refreshDate(date);

            bind(date, 'click', () => {
                this.dialog.showModal(
                    '#lang#comment_popup_creation_time_title#',
                    date[HTML_NODE_FIELD_DATE].toString().replace(' (', '<br>('),
                );
            });

            bind(reply, 'click', () => {
                this.replyToCommentModal.setTargetComment(comment);
                this.replyToCommentModal.modal.show();
            });

            bind(like, 'click', () => {
                this.likeComment(comment);
            });

            this.recalcIdsIndexAndPresence(id, isPositive);

            like.insertBefore(heart, likesCount);

            (isPagination ? push : unshift)(
                this.wrapComment(comment, isPositive),
                this.getParentContainerForComment(isPositive),
            );

            this.foldText(comment);
        });
    }

    getCommentUrl(comment) {
        return `#comment:${comment[HTML_NODE_FIELD_COMMENT_ID]}`;
    }

    foldText(comment) {
        const textWrap = $(CSS_CLASS_COMMENT_TEXT_WRAP, comment);
        const text = $(CSS_CLASS_COMMENT_TEXT, comment);

        const wrapHeight = textWrap.offsetHeight;

        if (text.offsetHeight <= wrapHeight) {
            return;
        }

        text.classList.add(CSS_CLASS_COMMENT_TEXT_BIG.substr(1));

        const showFull = createNode('div', [
            CSS_CLASS_COMMENT_SHOW_FULL,
            CSS_CLASS_COMMENT_TEXT_ACTION,
        ]);

        showFull.innerText = '#lang#show_full_comment#';

        const looseClassName = CSS_CLASS_COMMENT_TEXT_WRAP_LOOSE.substr(1);
        const textWrapClassList = textWrap.classList;

        bind(showFull, 'click', event => {
            event.preventDefault();

            const mustBeShown = showFull[HTML_NODE_FIELD_SHOWN] = !showFull[HTML_NODE_FIELD_SHOWN];

            if (!mustBeShown) {
                textWrapClassList.remove(looseClassName);
                showFull.innerText = '#lang#show_full_comment#';
            } else {
                textWrapClassList.add(looseClassName);
                showFull.innerText = '#lang#hide_full_comment#';
            }
        });

        comment.insertBefore(showFull, $(CSS_CLASS_COMMENT_ACTION_BAR, comment));
    }

    refreshDate(node) {
        const date = node[HTML_NODE_FIELD_DATE];
        const now = new Date;

        let value = '';

        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const hh = date.getHours();
        const mm = date.getMinutes();

        if (y != now.getFullYear()) {
            value = `${d} ${monthName(m)} ${y}`;
        } else if (m != now.getMonth() || d != now.getDate()) {
            value = `${d} ${monthName(m)}`;
        } else if (hh != now.getHours() || mm != now.getMinutes()) {
            value = `${addz(hh)}:${addz(mm)}`;
        } else {
            value = '#lang#format_time_right_now#';
        }

        node.innerText = value;
    }

    refreshRepliesForComment(comment, repliesCount) {
        let repliesRow = $(CSS_CLASS_COMMENT_REPLIES, comment);
        let repliesContainer = $(CSS_CLASS_COMMENT_REPLIES_CONTAINER, comment);

        if (!repliesCount) {
            if (repliesRow) {
                remove(repliesRow);
                remove(repliesContainer);
                this.recalcColsHeights();
            }

            return;
        }

        if (repliesRow) {
            repliesRow[HTML_NODE_FIELD_REPLIES_COUNT] = repliesCount;
        } else {
            repliesRow = createNode('div', [
                CSS_CLASS_COMMENT_REPLIES,
            ]);

            repliesRow[HTML_NODE_FIELD_REPLIES_COUNT] = repliesCount;

            repliesContainer = createNode('div', [
                CSS_CLASS_COMMENT_REPLIES_CONTAINER,
            ]);

            const repliesText = createNode('div', [
                CSS_CLASS_COMMENT_REPLIES_TEXT,
            ]);

            const unfold = dup(CSS_CLASS_ICON_UNFOLD);

            push(unfold, repliesRow);
            push(repliesText, repliesRow);
            push(repliesRow, comment);
            push(repliesContainer, comment);

            bind(repliesRow, 'click',
                this.toggleRepliesRow.bind(this, comment, repliesRow, repliesContainer));
        }

        this.refreshRepliesRow(comment, repliesRow, repliesContainer);
    }

    toggleRepliesRow(comment, repliesRow, repliesContainer) {
        const repliesRowClassList = repliesRow.classList;
        const unfoldedClassName = CSS_CLASS_COMMENT_REPLIES_UNFOLDED.substr(1);

        if (repliesRowClassList.contains(unfoldedClassName)) {
            repliesRowClassList.remove(unfoldedClassName);
        } else {
            repliesRowClassList.add(unfoldedClassName);
        }

        this.refreshRepliesRow(comment, repliesRow, repliesContainer);
    }

    refreshRepliesRow(comment, repliesRow, repliesContainer) {
        const unfoldedClassName = CSS_CLASS_COMMENT_REPLIES_UNFOLDED.substr(1);
        const repliesRowClassList = repliesRow.classList;

        const repliesText = $(CSS_CLASS_COMMENT_REPLIES_TEXT, repliesRow);

        if (repliesRowClassList.contains(unfoldedClassName)) {
            repliesText.innerText = '#lang#fold_replies#';

            this.loadRepliesForComment(comment, repliesContainer);
        } else {
            repliesText.innerText = icaseLang(
                repliesRow[HTML_NODE_FIELD_REPLIES_COUNT],
                '#lang#unfold_x_replies__0#',
                '#lang#unfold_x_replies__1#',
                '#lang#unfold_x_replies__2#',
            );
        }

        this.recalcColsHeights();
    }

    // TODO: add loader if first call
    // TODO: popup error if error on first call
    loadRepliesForComment(comment, repliesContainer, isPagination = false) {
        const params = {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_COMMENT_ID]: comment[HTML_NODE_FIELD_COMMENT_ID],
            [API_PARAM_APP_USER_TOKEN]: APP_USER_TOKEN,
        };

        const oldestReplyId = repliesContainer[HTML_NODE_FIELD_OLDEST_REPLY_ID];
        const newestReplyId = repliesContainer[HTML_NODE_FIELD_NEWEST_REPLY_ID];

        if (isPagination) {
            if (oldestReplyId) {
                params[API_PARAM_OLDEST_REPLY_ID] = oldestReplyId;
            }
        } else {
            if (newestReplyId) {
                params[API_PARAM_NEWEST_REPLY_ID] = newestReplyId;
            }
        }

        ajax(API_HTTP_METHOD_GET, API_BASE_URL + API_METHOD_GET_COMMENT_REPLIES, params, json => {
            if (apiRequestFailed(json)) return;

            const replies = json[API_PARAM_REPLIES];

            if (!replies.length) return;

            replies.reverse().forEach(reply =>
                this.pushReplyToComment(comment, repliesContainer, reply));

            this.recalcColsHeights();
        });
    }

    pushReplyToComment(comment, repliesContainer, reply) {
        const oldestReplyId = repliesContainer[HTML_NODE_FIELD_OLDEST_REPLY_ID];
        const newestReplyId = repliesContainer[HTML_NODE_FIELD_NEWEST_REPLY_ID];
        const replyId = reply[API_PARAM_ID];

        if (!oldestReplyId || replyId < oldestReplyId) {
            repliesContainer[HTML_NODE_FIELD_OLDEST_REPLY_ID] = replyId;
        }

        if (!newestReplyId || replyId > newestReplyId) {
            repliesContainer[HTML_NODE_FIELD_NEWEST_REPLY_ID] = replyId;
        }

        const replyNode = createNode('div', [
            CSS_CLASS_COMMENT_REPLY_ROW,
        ]);

        const replyAuthorNameNode = createNode('span', [
            CSS_CLASS_COMMENT_REPLY_ROW_AUTHOR_NAME,
        ]);

        const replyTextNode = createNode('span');

        replyAuthorNameNode.innerText =
            (reply[API_PARAM_NAME] || '#lang#comment_anonymous_name#') + ':';

        replyTextNode.innerText = reply[API_PARAM_TEXT];

        push(replyAuthorNameNode, replyNode);
        push(replyTextNode, replyNode);
        unshift(replyNode, repliesContainer);
    }
}

Comments.commentsPerQuery = 20;
