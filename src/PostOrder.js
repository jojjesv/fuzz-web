import React, { Component } from 'react';
import ModalDialog from './ModalDialog';
import './PostOrder.css';
import Backend from './Backend';
import Truck from './Truck'

//  Timer size, in px
const timerSize = 250;

class ETATimer extends React.Component {
    canvas = null;
    canvasBounds = null;
    targetMs = null;
    startDate = null;

    state = {
        tickerStr: null,
        tickerTime: 0
    }

    componentDidMount(){
        this.start(this.props.etaMins * 60);    
    }

    /**
     * Animates the timer.
     */
    start(targetSeconds){
        this.targetMs = targetSeconds * 1000;
        this.setState({
            tickerTime: targetSeconds + 1
        });
        this.startDate = new Date();
        this.update()
        this.updateTicker();
    }

    update(){
        if (!this.canvas) {
            //  Probably not mounted
            return;
        }

        let context = this.canvas.getContext("2d")

        let percent = Math.min((new Date().getTime() - this.startDate.getTime()) / this.targetMs, 1);
        let rad = Math.min(this.canvasBounds.height, this.canvasBounds.width) / 2;
        let startRads = Math.PI * 1.5;
        let endRads = Math.PI * 2 * percent + startRads;
        context.clearRect(0, 0, this.canvasBounds.width, this.canvasBounds.height);
        //context.moveTo(rad, rad);
        context.beginPath();
        context.moveTo(rad, rad);
        context.lineTo(rad, 0);
        context.arc(rad, rad, rad, startRads, endRads, false);
        context.moveTo(rad, rad);
        context.lineTo(rad + Math.cos(endRads) * rad, rad + Math.sin(endRads) * rad);

        context.fillStyle = "#E35278";
        context.fill();

        if (percent < 1) {
            requestAnimationFrame(this.update.bind(this))
        }
    }

    updateTicker(){
        this.setState((old) => {
            old.tickerTime--;
            var minutes = "" + Math.floor(old.tickerTime / 60);
            if (minutes.length == 1) {
                minutes = "0" + minutes;
            }

            var seconds = "" + Math.floor(old.tickerTime % 60);
            if (seconds.length == 1) {
                seconds = "0" + seconds;
            }
            old.tickerStr = minutes + ":" + seconds;
            
            if (old.tickerTime > 0) {
                setTimeout(this.updateTicker.bind(this), 1000);
            } else {
                this.onTickerReachedZero();
            }
            return old;
        });
    }

    /**
     * Called when the ticker reaches zero.
     */
    onTickerReachedZero(){

    }

    render() {
        const _this = this;
        const state = this.state;
        return (
            <div style={{
                width: timerSize,
                height: timerSize,
                margin: 'auto'
            }}>

                <div style={{
                    width: timerSize,
                    height: timerSize,
                    background: 'rgba(227, 82, 120,0.33)',
                    position: 'absolute',
                    borderRadius: '50%'
                }}>
                </div>
                <p id="post-order-ticker">{state.tickerStr}</p>
                <canvas id="post-order-timer" ref={
                    (e) => {
                        _this.canvas = e;
                        if (e){
                            _this.canvasBounds = e.getBoundingClientRect();
                        }
                    }
                } width={timerSize} height={timerSize}></canvas>

            </div>
        )
    }

    componentWillReceiveProps(next){
        if (next.targetSeconds) {
            this.start(next.targetSeconds);
        }
    }
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

//  Milliseconds between each ETA poll.
const etaPollInterval = 2000;

/**
 * Post-order dialog.
 */
export default class PostOrder extends ModalDialog {
    trivialMessages = [
        "Paketerar regnbågar",
        "Botar sockersjuka",
        "Ordnar första hjälpen mot sockersug",
        "Skördar snacks",
        "Jagar gummibjörnar på rymmen"
    ];
    trivialMessagesIndex = 0
    state = {
        trivialMessage: this.trivialMessages[this.trivialMessagesIndex],
        etaMins: 0,
        subheader: "Vänta lite medan vi bekräftar din beställning."
    }

    trivialMessageElement = null;
    subheaderElement = null;
    pollEtaInterval = 0;

    constructor(props){
        super(props)
        this.contentId = "post-order-dialog";
        this.listenForETAChange(props.orderId)
        shuffle(this.trivialMessages)
    }

    /**
     * Continuously listens for an ETA change for a given order ID.
     */
    listenForETAChange(orderId){
        this.pollEtaInterval = setInterval(() => {
            this.pollETA(orderId);
        }, etaPollInterval);
    }

    /**
     * Polls an eta change for a given order ID.
     */
    pollETA(orderId){
        Backend.request("out=delivery_eta&order_id=" + orderId, null, (response) => {
            if (response.length > 0) {
                //  Has ETA
                let json = JSON.parse(response);

                this.setState({
                    etaMins: json.minutes
                })
                this.animateTextChange(this.subheaderElement, "Din beställning levereras av " + json.deliverer, "subheader");
                clearInterval(this.pollEtaInterval);
            }
        });
    }

    show() {
        super.show();
        this.cycleTrivialMessages();
    }

    cycleTrivialMessages(){
        setInterval(() => {
            
            let messages = this.trivialMessages
            this.trivialMessagesIndex = (this.trivialMessagesIndex + 1) % messages.length;

            this.setTrivialMessage(messages[this.trivialMessagesIndex])

        }, 3500);
    }

    setTrivialMessage(message) {
        let element = this.trivialMessageElement

        if (!element) {
            //  Not mounted
            return;
        }

        this.animateTextChange(element, message, "trivialMessage");
    }

    /**
     * Animates and changes the subheader text.
     * @param {String} message New message.
     * @param {String} stateKey Key of state whose value will be the new message.
     */
    animateTextChange(element, message, stateKey) {
        let listener = (ev) => {
            if (element.classList.contains('fade-out')) {
                let newState = {};
                newState[stateKey] = message;
                this.setState(newState);

                element.classList.remove('fade-out');
                element.classList.add('fade-in');
            } else {
                element.classList.remove('fade-in');
            }

            element.removeEventListener('animationend', listener);
        };

        element.addEventListener('animationend', listener, false);

        element.classList.add('fade-out');
    }

    renderContent() {
        let st = this.state;
        return (
            <div>
                <h1 className="shadowed">Beställningen är på väg!</h1>
                <h2 className="shadowed" ref={
                    (e) => this.subheaderElement = e
                }>{st.subheader}</h2>

                {
                    st.etaMins ?
                        <ETATimer etaMins={st.etaMins} />
                    :
                    <div style={{
                        textAlign: 'center'
                    }}>
                        <Truck />
                    </div>
                }

                <div style={{
                    textAlign: 'center'
                }}>
                    <p ref={
                        (e) => this.trivialMessageElement = e
                    } id="trivial-message">{st.trivialMessage}</p>
                </div>
            </div>
        )
    }
}