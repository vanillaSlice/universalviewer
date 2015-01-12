/// <reference path="../../js/jquery.d.ts" />
/// <reference path="../../js/extensions.d.ts" />

import utils = require("../../utils");
import shell = require("../coreplayer-shared-module/shell");
import baseView = require("../coreplayer-shared-module/baseView");
import TreeNode = require("../coreplayer-shared-module/treeNode");
import baseExtension = require("../coreplayer-shared-module/baseExtension");
import util = utils.Utils;

export class TreeView extends baseView.BaseView {

    $tree: JQuery;
    selectedNode: any;
    isOpen: boolean = false;
    elideCount: number;

    public rootNode: TreeNode;

    static NODE_SELECTED: string = 'treeView.onNodeSelected';

    constructor($element: JQuery) {
        super($element, true, true);
    }

    create(): void {
        super.create();

        var that = this;

        $.subscribe(baseExtension.BaseExtension.CANVAS_INDEX_CHANGED, (e, canvasIndex) => {
            this.selectTreeNodeFromCanvasIndex(canvasIndex);
        });

        this.$tree = $('<ul class="tree"></ul>');
        this.$element.append(this.$tree);

        $.templates({
            pageTemplate: '{^{for nodes}}\
                               {^{tree/}}\
                           {{/for}}',
            treeTemplate: '<li>\
                               {^{if nodes && nodes.length}}\
                                   {^{if expanded}}\
                                       <div class="toggle expanded"></div>\
                                   {{else}}\
                                       <div class="toggle"></div>\
                                   {{/if}}\
                               {{else}}\
                                   <div class="spacer"></div>\
                               {{/if}}\
                               {^{if selected}}\
                                   <a href="#" title="{{>label}}" class="selected">{{>text}}</a>\
                               {{else}}\
                                   <a href="#" title="{{>label}}">{{>text}}</a>\
                               {{/if}}\
                           </li>\
                           {^{if expanded}}\
                               <li>\
                                   <ul>\
                                       {^{for nodes}}\
                                           {^{tree/}}\
                                       {{/for}}\
                                   </ul>\
                               </li>\
                           {{/if}}'
        });

        $.views.tags({
            tree: {
                toggle: function () {
                    $.observable(this.data).setProperty("expanded", !this.data.expanded);
                },
                init: function (tagCtx, linkCtx, ctx) {
                    var data = tagCtx.view.data;
                    data.text = util.htmlDecode(util.ellipsis(data.label, that.elideCount));
                    this.data = tagCtx.view.data;
                },
                onAfterLink: function () {
                    var self = this;

                    self.contents("li").first()
                        .on("click", ".toggle", function () {
                            self.toggle();
                        }).on("click", "a", function (e) {
                            e.preventDefault();

                            if (self.data.nodes.length){
                                self.toggle();
                            }

                            $.publish(TreeView.NODE_SELECTED, [self.data.data]);
                        })
                },
                template: $.templates.treeTemplate
            }
        });
    }

    public dataBind(): void {
        if (!this.rootNode) return;

        this.$tree.link($.templates.pageTemplate, this.rootNode);
        this.resize();
    }

    public selectPath(path: string): void {
        if (!this.rootNode) return;

        var pathArr = path.split("/");
        if (pathArr.length >= 1) pathArr.shift();
        var node = this.getNodeByPath(this.rootNode, pathArr);

        this.selectNode(node);
    }

    selectTreeNodeFromCanvasIndex(index: number): void {
        // may be authenticating
        if (index == -1) return;

        this.deselectCurrentNode();

        var structure = this.provider.getStructureByCanvasIndex(index);

        if (!structure) return;

        if (structure.treeNode) this.selectNode(structure.treeNode);
    }

    deselectCurrentNode(): void {
        if (this.selectedNode) $.observable(this.selectedNode).setProperty("selected", false);
    }

    selectNode(node: TreeNode): void{
        if (!this.rootNode) return;

        this.selectedNode = node;
        $.observable(this.selectedNode).setProperty("selected", true);

        this.expandParents(this.selectedNode);
    }

    // walk up the tree expanding parent nodes.
    expandParents(node: TreeNode): void{
        if (!node.parentNode) return;

        $.observable(node.parentNode).setProperty("expanded", true);
        this.expandParents(node.parentNode);
    }

    // walks down the tree using the specified path e.g. [2,2,0]
    getNodeByPath(parentNode: TreeNode, path: string[]): TreeNode {

        if (path.length == 0) return parentNode;
        var index = path.shift();
        var node = parentNode.nodes[index];
        return this.getNodeByPath(node, path);
    }

    public show(): void {
        this.isOpen = true;
        this.$element.show();
    }

    public hide(): void {
        this.isOpen = false;
        this.$element.hide();
    }

    resize(): void {
        super.resize();
    }
}