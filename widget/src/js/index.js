const CSS_CLASS_FOOTER_BUTTON = '.footer__button';

bind(window, 'DOMContentLoaded', () => {
    const dialog = new Dialog;
    const statusRow = new StatusRow;
    const comments = new Comments(dialog, statusRow);
    const createCommentModal = new CreateCommentModal(dialog, statusRow, comments);

    bind(CSS_CLASS_FOOTER_BUTTON, 'click', () => {
        createCommentModal.modal.show();
    });
});
