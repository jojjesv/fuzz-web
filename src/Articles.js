import React, { Component } from 'react';
import Backend from './Backend';

/**
 * Articles management.
 */
export default class Articles extends React.Component {
    state = {
        articleElements: []
    }

    fetchResultCount = 20
    fetchPage = 0
    isFetching = false

    constructor(params) {
        super(params);

        setTimeout(() => {
            this.fetch();
        }, 2000);
    }

    /**
     * Fetches articles.
     * @param {Array} categories Array of category IDs to request as filter.
     */
    fetch(categories) {
        if (this.isFetching) {
            return;
        }

        this.isFetching = true

        //  Show loading indicator

        var get = "out=articles&count=" + this.fetchResultCount
            + "&page=" + this.fetchPage;

        if (categories && categories.length > 0) {
            get += "&categories=";

            var i = 0;
            for (let c of categories) {
                get += c;

                if (i < categories.length - 1) {
                    get += ",";
                }
            }

        } else {
            //  Request popular articles
            get += "&popular";
        }

        Backend.request(get, null, this.parse.bind(this))
    }

    /**
     * Parses fetched articles response.
     */
    parse(response){
        let json = JSON.parse(response);

        if (!json) {
            this.onParseError();
            return;
        }

        let baseImageUrl = json.base_image_url;
        let articles = json.articles;

        if (articles.length > 0) {

            var elementData = {};
            var quantities;
            var costs;
            for (let article of articles) {
                quantities = article.quantities.split(",");
                costs = article.costs.split(",");

                for (var i = 0; i < quantities.length; i++) {
                    elementData[article.id] = {
                        image: baseImageUrl + article.image,
                        quantity: quantities[i],
                        cost: costs[i],
                        name: article.name,
                        isNew: article.is_new
                    };
                }
            }

            //  Array of new article elements
            var elements = [];
            for (let e in elementData) {
                e = elementData[e];
                elements.push((
                    <div className="article">
                        <div>
                            <div className="thumbnail" style={ { backgroundImage: 'url(' + e.image + ')' } }></div>
                        </div>
                        <h2 className="name">{ e.name }</h2>
                    </div>
                ));
            }

            const newElements = elements;

            this.setState((old) => {
                if (old.articleElements) {
                    old.articleElements = old.articleElements.concat(newElements);
                } else {
                    old.articleElements = newElements;
                }

                return old;
            });
        }
    }

    /**
     * Called if an error occurred during parse.
     */
    onParseError(){

    }

    render(){
        return (
            <div>
                { this.state.articleElements }
            </div>
        );
    }
}