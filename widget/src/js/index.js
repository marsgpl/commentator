bind(window, 'DOMContentLoaded', () => {
    const dialog = new Dialog;
    const statusRow = new StatusRow;

    const replyToCommentModal = new ReplyToCommentModal(dialog);
    const createCommentModal = new CreateCommentModal(dialog, statusRow);

    const commentsMono = new CommentsMono(dialog, statusRow, replyToCommentModal);
    const commentsDual = new CommentsDual(dialog, statusRow, replyToCommentModal);

    replyToCommentModal.commentsColumns = [commentsMono, commentsDual];
    createCommentModal.commentsColumns = [commentsMono, commentsDual];

    bind(CSS_CLASS_FOOTER_BUTTON, 'click', () => {
        createCommentModal.modal.show();
    });
});
