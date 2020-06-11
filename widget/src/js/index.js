bind(window, 'DOMContentLoaded', () => {
    const dialog = new Dialog;
    const statusRow = new StatusRow;
    const commentsMono = new CommentsMono(dialog, statusRow);
    const commentsDual = new CommentsDual(dialog, statusRow);
    const createCommentModal = new CreateCommentModal(
        dialog,
        statusRow,
        [ commentsMono, commentsDual ],
    );

    bind(CSS_CLASS_FOOTER_BUTTON, 'click', () => {
        createCommentModal.modal.show();
    });
});
