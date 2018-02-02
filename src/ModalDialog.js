import React, { Component } from "react";
import './ModalDialog.css'
import { Transition } from 'react-transition-group';

/**
 * Modal dialog, whichs wraps content from renderContent() inside a dialog container.
 */

const animationDuration = 350;

export default class ModalDialog extends React.Component {
    state = {
        hasBeenVisible: false,
        visible: false
    }

    showTimestamp = 0;

    /**
     * ID of content element.
     */
    contentId = "";

    /**
     * ID of background element.
     */
    bgId = "";

    componentDidMount(){
        if (this.props.visible) {
            this.show();
        }
    }
    
    /**
     * Shows this modal dialog.
     */
    show(){
        this.showTimestamp = new Date().getTime();
        this.setState({
            hasBeenVisible: true,
            visible: true
        })
        document.body.setAttribute("has-modal", "1");
    }
    
    dismiss(){
        if (!this.canDismiss()){
            return;
        }

        this.setState({
            visible: false
        })
        document.body.removeAttribute("has-modal");

        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    canDismiss(){
        return new Date().getTime() - this.showTimestamp > 200;
    }

    renderContent(){
        return this.props.children
    }
    
    render(){
        let st = this.state;

        if (!st.hasBeenVisible) {
            return null;
        }

        let dontUnmount = this.props.dontUnmount == null ? false
            : this.props.dontUnmount;

        return (
            <Transition component='div' in={st.visible} timeout={{
                enter: 0,
                exit: animationDuration
            }} unmountOnExit={!dontUnmount}>
                {
                    (state) => (
                        <div className={"modal-bg " + state} id={this.bgId} onClick={
                            this.dismiss.bind(this)
                        } style={{
                            transition: `opacity ${animationDuration}ms`
                        }}>
                            <div className={"modal " + state} id={this.contentId} onClick={
                                (ev) => {
                                    ev.stopPropagation();
                                }
                            } style={{
                                transition: `top ${animationDuration}ms cubic-bezier(0.165, 0.84, 0.44, 1)`
                            }}>
                            { this.renderContent() }
                            </div>
                        </div>
                    )
                }
            </Transition>
        )
    }
}