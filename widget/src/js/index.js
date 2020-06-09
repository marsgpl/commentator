const CSS_CLASS_LOADER = '.loader';
const CSS_CLASS_FOOTER_BUTTON = '.footer__button';
const CSS_CLASS_BUTTON = '.button';
const CSS_CLASS_BUTTON_SIZE_BIG = '.button_size_big';
const CSS_CLASS_TEMPLATES = '.templates';
const CSS_CLASS_HEART = '.heart';
const CSS_CLASS_HEART_ACTIVE = '.heart__active';
const CSS_CLASS_HEADER = '.header';
const CSS_CLASS_STATUS = '.status';
const CSS_CLASS_FOOTER = '.footer';

const APP_USER_TOKEN = storageRead(STORAGE_KEY_APP_USER_TOKEN) ||
    storageWrite(STORAGE_KEY_APP_USER_TOKEN, uuid());

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
