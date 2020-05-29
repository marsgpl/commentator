bind(window, 'DOMContentLoaded', function() {
    const createCommentModal = new ModalPopup(CSS_CLASS_CREATE_COMMENT_MODAL);
    const createCommentModalForm = new Form(CSS_CLASS_CREATE_COMMENT_MODAL_FORM);

    bind(CSS_CLASS_FOOTER_BUTTON, 'click', function() {
        createCommentModal.show();
    });
});
