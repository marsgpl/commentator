const CSS_CLASS_LOADER = '.loader';
const CSS_CLASS_FOOTER_BUTTON = '.footer__button';
const CSS_CLASS_BUTTON = '.button';
const CSS_CLASS_BUTTON_SIZE_BIG = '.button_size_big';

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
