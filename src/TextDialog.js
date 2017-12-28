import React, { Component } from 'react';
import ModalDialog from './ModalDialog';

const styles = {
    dialogContent: {
        maxWidth: '320px',
        top: '50%',
        transform: 'transform(-50%, -50%)'
    }
};

/**
 * A modal dialog which shows a message and a caption.
 */
export default class TextDialog extends ModalDialog {
    constructor(props) {
        super(props);
        this.contentId = "text-dialog";
    }

    renderContent(){
        let props = this.props;
        return (
            <div style={styles.dialogContent}>
                {
                    props.caption &&
                    <h2>{props.caption}</h2>
                }
                <p>{props.message}</p>
            </div>
        )
    }
}