import React, { Component } from 'react';
import ModalDialog from './ModalDialog';
import Article from './Article';
import ShoppingCart from './ShoppingCart'

const styles = {
    listItem: {
        display: 'inline-block'
    }
}

/**
 * A modal dialog which shows a grid of articles.
 */
export default class CartItems extends ModalDialog {
    constructor(props) {
        super(props);

        this.contentId = "cart-items-modal";
    }
    renderContent(){
        return (
            <ul>{
                this.props.items.map((e, i) => (
                    <li style={styles.listItem}>
                        <Article
                            name={e.name}
                            image={e.image}
                            removable={true}
                            isNew={false}
                            quantity={e.quantity}
                            cost={e.cost}
                            onRemoveItem={() => {
                                ShoppingCart.removeFromCart(e);
                            }}/>
                    </li>
                ))
            }</ul>
        )
    }
}