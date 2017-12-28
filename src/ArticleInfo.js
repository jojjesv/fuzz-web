import React, { Component } from 'react';
import Backend from './Backend';
import ModalDialog from './ModalDialog';
import './ArticleInfo.css';
import gloss from './assets/gloss.png';
import lightred_logo from './assets/ic_logo_lightred_48dp.png';
import ic_list_24dp from './assets/ic_list_24dp.png';

/**
 * Component which presents additional info about an article.
 */
export default class ArticleInfo extends ModalDialog {
    state = {
        fetching: true
    }

    articleData = null;

    constructor(props){
        super(props);

        this.contentId = "article-info";
        this.bgId = "article-info-bg";
    }

    /**
     * Fetches info for the article with the id corresponding to
     * a data object's ID property.
     */
    fetch(data){
        this.setState({
            fetching: true
        });
        let id = data.id;

        Backend.request("out=article_info&id=" + id, null, this.parse.bind(this));
    }

    /**
     * Parses the response from fetch.
     * @param {String} response 
     */
    parse(response){
        let json = JSON.parse(response);

        this.setState({
            contents: json.contents ? 'Innehåller ' + json.contents :
                'Har ingen innehållsinformation',
            description: json.description,
            fetching: false
        });
    }

    /**
     * Performs setup from article data.
     */
    setupFromData(data){
        this.show()
        this.fetch(data);
    }

    componentWillReceiveProps(next) {
        if (next.data) {
            this.articleData = next.data;
            this.setupFromData(next.data);
        }
    }

    renderContent(){
        let article = this.articleData;

        if (!article) {
            return null;
        }

        let st = this.state;
        let image = article.image;
        let name = article.name;
        let description = st.description;
        let contents = st.contents;

        return (
            <div>
                <div id="thumbnail" style={ { backgroundImage: 'url(' + gloss + '),url(' + image + ')' } }></div>
                <h1>{ name } { article.quantity } st.</h1>
                {
                    st.fetching ?
                    <img src={lightred_logo} className="loading" alt="Laddar..." />
                    : (description && <p id="description">{ description }</p>)
                }
                {
                    !st.fetching && 
                    <p id="contents">
                        <img style={{
                            position: 'relative',
                            top: 6,
                            marginRight: 4
                        }}src={ic_list_24dp} alt="" />{ contents }
                    </p>
                }
            </div>
        );
    }
}