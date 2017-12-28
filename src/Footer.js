import React, { Component } from 'react';
import App from './App';
import './Footer.css';
import Backend from './Backend';
import { Transition } from 'react-transition-group';

const animationDuration = 125;

const feedbackStyles = {
    normal: {
        transformOrigin: '100% 0',
        transition: `transform ${animationDuration}ms, opacity ${animationDuration}ms`,
        display: "inline-block",
        position: "absolute"
    },
    hidden: {
        transform: 'scale(0.85)',
        opacity: 0
    }
}

/**
 * Footer with company and app information.
 */

export default class Footer extends React.Component {
    state = {
        showFeedback: false,
        sentFeedback: false
    };

    feedbackMessage = null;

    /**
     * Submits the feedback message.
     */
    submitFeedback(){
        Backend.request("action=send_feedback", {
            platform: 'web',
            app_version: App.version,
            message: this.feedbackMessage
        }, this.parseSubmitFeedback.bind(this));
    }

    /**
     * Parses a response from submit feedback request.
     */
    parseSubmitFeedback(response){
        this.setState({
            showFeedback: false,
            sentFeedback: true
        })
    }

    render(){
        let config = this.props.config;
        let appVersion = App.version;
        let state = this.state;

        return (
            <footer>
                <ul id="company-info">
                    <li>{config.company_name}</li>
                    <li>{config.company_email}</li>
                    <li>{config.company_address}</li>
                    <li>{config.company_phone_num}</li>
                </ul>
                <ul id="app-info">
                    <Transition in={state.showFeedback} timeout={{
                        enter: 0,
                        exit: animationDuration
                    }} unmountOnExit={true}>
                    {
                        (state) => (
                            <div>
                                <div style={
                                    state == 'entering' || state == 'exiting' ?
                                        Object.assign({}, feedbackStyles.hidden, feedbackStyles.normal) :
                                        feedbackStyles.normal}>

                                    <textarea id="feedback-msg" placeholder="Vad funderar du på?"
                                        defaultValue={this.feedbackMessage} spellCheck="false"
                                        onChange={
                                            (ev) => {
                                                this.feedbackMessage = ev.target.value
                                            }
                                        } maxLength="255" />
                                    
                                    <button id="feedback-submit" onClick={this.submitFeedback.bind(this)}>
                                        Skicka
                                    </button>
                                </div>
                            </div>
                        )
                    }
                    </Transition>

                    {
                        !state.showFeedback &&
                        <li>v{appVersion}</li>
                    }
                    <li>
                        <a id="send-feedback" onClick={
                            (ev) => {
                                if (!state.sentFeedback) {
                                    this.setState({
                                        showFeedback: true
                                    })
                                }
                            }
                        }  disabled={state.sentFeedback}>
                        {
                            !state.sentFeedback ? "Skicka feedback" : "Tack för din feedback!"
                        }
                        </a>
                    </li>
                </ul>
            </footer>
        );
    }
}