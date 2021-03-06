/*
 * Copyright (C) 2015 Opersys inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function (require) {
    "use strict";

    var d3 = require("d3");
    var _ = require("underscore");
    var Backbone = require("backbone");

    var Directed = function () {
        var self = this;

        self._linksFrom = {};
        self._linksTo = {};
        _.extend(this, Backbone.Events);
    };

    var Undirected = function () {
        var self = this;

        self._linksFrom = {};
        _.extend(this, Backbone.Events);
    };

    Directed.prototype.getLinks = function (makeLinkCb) {
        var self = this;
        var links = [], linkVal;

        if (!makeLinkCb) throw "callback missing";

        _.keys(self._linksFrom).forEach(function (from) {
            if (self._linksFrom[from] != null) {
                self._linksFrom[from].forEach(function (to) {
                    linkVal = makeLinkCb(from, to);
                    if (linkVal) links.push(linkVal);
                });
            }
        });

        return links;
    };

    Undirected.prototype.getLinks = function (makeLinkCb) {
        var self = this;
        var links = [], linkVal;
        var doneLinks = d3.set();

        if (!makeLinkCb) throw "callback missing";

        _.keys(self._linksFrom).forEach(function (x) {
            if (self._linksFrom[x] != null) {
                self._linksFrom[x].forEach(function (y) {
                    var ak = x.toString() + "@@" + y.toString(),
                        bk = y.toString() + "@@" + x.toString();

                    // Handles deleted links.
                    if (self._linksFrom[y] === null) {
                        self._linksFrom[x].remove(y);
                        return;
                    }

                    if (!doneLinks.has(ak) && !doneLinks.has(bk)) {
                        doneLinks.add(ak);
                        doneLinks.add(bk);

                        linkVal = makeLinkCb(x, y);
                        if (linkVal) links.push(linkVal);
                    }
                });
            }
        });

        return links;
    };

    Directed.prototype.getLinksFrom = function (from, makeLinkCb) {
        var self = this;
        var links = [], linkVal;

        if (!makeLinkCb) throw "callback missing";

        if (self._linksFrom[from] != null) {
            self._linksFrom[from].forEach(function (to) {

                // Handles deleted links
                if (self._linksFrom[to] === null) {
                    self._linksFrom[to].remove(to);
                    return;
                }

                linkVal = makeLinkCb(from, to);
                if (linkVal) links.push(linkVal);
            });
        }

        return links;
    };

    Undirected.prototype.getLinksFrom = function (a, makeLinkCb) {
        var self = this;
        var links = [], linkVal;

        if (!makeLinkCb) throw "callback missing";

        if (self._linksFrom[a]) {
            self._linksFrom[a].forEach(function (y) {
                if (self._linksFrom[y] === null) {
                    self._linksFrom[a].remove(y);
                }
                else {
                    linkVal = makeLinkCb(a, y);
                    if (linkVal) links.push(linkVal);
                }
            });
        }

        return links;
    };

    Directed.prototype.addLink = function (from, to) {
        var self = this;

        if (!self._linksFrom[from]) {
            self._linksFrom[from] = d3.set();
        }

        self._linksFrom[from].add(to);

        self.trigger("linkadded", from, to);
    };

    Undirected.prototype.addLink = function (a, b) {
        var self = this;

        if (!self._linksFrom[a]) {
            self._linksFrom[a] = d3.set();
        }
        if (!self._linksFrom[b]) {
            self._linksFrom[b] = d3.set();
        }

        self._linksFrom[a].add(b);
        self._linksFrom[b].add(a);

        self.trigger("linkadded", a, b);
    };

    Undirected.prototype.removeAll = function (a) {
        var self = this, oldLinks;

        if (self._linksFrom[a]) {
            oldLinks = self._linksFrom[a];
            self._linksFrom[a] = null;

            oldLinks.forEach(function (b) {
                self.trigger("linkremoved", a, b);
            });
        }
    };

    return {
        Undirected: Undirected,
        Directed: Directed
    };
});